import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { globalLimiter } from './middleware/rateLimit.js';
import './config/passport.js';
import authRoutes from './routes/auth.js';
import eventsRoutes from './routes/events.js';
import registrationsRoutes from './routes/registrations.js';
import judgeRoutes from './routes/judge.js';
import ctfRoutes from './routes/ctf.js';
import leaderboardRoutes from './routes/leaderboard.js';
import adminRoutes from './routes/admin.js';
import formsRoutes from './routes/forms.js';
import profileRoutes from './routes/profile.js';
import { Event } from './models/index.js';

dotenv.config();

// ── Guard: refuse to boot without required secrets ────────────────────────
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set. Refusing to start.');
  process.exit(1);
}


const app = express();

// Trust the first proxy hop (required when running behind Docker / HF Spaces / Nginx)
// Fixes: ERR_ERL_UNEXPECTED_X_FORWARDED_FOR from express-rate-limit
app.set('trust proxy', 1);

const server = http.createServer(app);

// Socket.IO server with fallback to polling (transports: ['polling', 'websocket'])
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || '*',
    credentials: true,
  },
  transports: ['polling', 'websocket'], // fallback to polling is critical on HF spaces
});

// CORS must be first — browser sends OPTIONS preflight before the real request.
// If cors() runs after globalLimiter/helmet, the preflight gets no CORS headers
// and the browser blocks the actual POST with ERR_FAILED.
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(globalLimiter);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // needed for Vite/React inline scripts
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", process.env.CLIENT_ORIGIN || 'http://localhost:5173', 'https://jaynaik2526-coding-club.hf.space'],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
}));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Database connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/codingclub';
mongoose
  .connect(mongoUri)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Health check endpoint
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    status: 'ok',
    db: dbStatus,
    timestamp: new Date(),
  });
});

// Crawler middleware to intercept bot scrapers and serve dynamic Open Graph SEO metadata
const CRAWLERS = [
  'googlebot', 'bingbot', 'yandexbot', 'duckduckbot',
  'baiduspider', 'twitterbot', 'facebookexternalhit',
  'discordbot', 'slackbot', 'telegrambot', 'whatsapp'
];

app.use(async (req, res, next) => {
  const userAgent = (req.headers['user-agent'] || '').toLowerCase();
  const isBot = CRAWLERS.some(bot => userAgent.includes(bot));

  if (isBot) {
    const urlPath = req.path;
    const match = urlPath.match(/^\/events\/([a-zA-Z0-9_-]+)$/);
    if (match) {
      const slug = match[1];
      try {
        const event = await Event.findOne({ slug });
        if (event) {
          const title = `${event.title} | Coding Club NMIMS`;
          const desc = event.description;
          const image = event.bannerUrl || 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800';
          const url = `${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}${urlPath}`;

          // Sanitise to prevent XSS via injected event content
          const esc = (s: string) => s
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
          const safeTitle = esc(title);
          const safeDesc = esc(desc);
          const safeImage = esc(image);
          const safeUrl = esc(url);

          const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDesc}" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDesc}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${safeUrl}" />
  <meta property="og:image" content="${safeImage}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDesc}" />
  <meta name="twitter:image" content="${safeImage}" />
</head>
<body>
  <h1>${safeTitle}</h1>
  <p>${safeDesc}</p>
</body>
</html>`;
          return res.status(200).send(html);
        }
      } catch (err) {
        // Fall back on errors
      }
    }
  }
  next();
});

app.use('/auth', authRoutes);
app.use('/events', eventsRoutes);
app.use('/registrations', registrationsRoutes);
app.use('/judge', judgeRoutes);
app.use('/ctf', ctfRoutes);
app.use('/leaderboard', leaderboardRoutes);
app.use('/admin', adminRoutes);
app.use('/forms', formsRoutes);
app.use('/profile', profileRoutes);

// Socket.io connection logic — verify JWT before allowing room joins
io.on('connection', (socket) => {
  const token = socket.handshake.auth?.token ||
    socket.handshake.headers?.cookie?.split('token=')?.[1]?.split(';')?.[0];

  let authedUserId: string | null = null;
  if (token) {
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      authedUserId = decoded.id;
    } catch {
      // token invalid — socket connected but cannot join private rooms
    }
  }

  socket.on('join', (room: string) => {
    // Only allow joining leaderboard rooms (public) or own user room
    const allowed = room.startsWith('leaderboard:') || room === `user:${authedUserId}`;
    if (allowed) {
      socket.join(room);
    }
  });

  socket.on('disconnect', () => {
    // cleanup handled automatically by Socket.IO
  });
});

// Make io instance accessible on app
app.set('io', io);

// Server listen
const PORT = process.env.PORT || 7860;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
