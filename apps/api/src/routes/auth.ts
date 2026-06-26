import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/index.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

// Cross-site deployment: frontend on vercel.app, API on hf.space.
// Browsers require SameSite=None + Secure for cookies to be sent cross-site.
// HF Spaces sets PORT=7860 but not NODE_ENV=production, so we detect both.
const isDeployed = process.env.NODE_ENV === 'production' || process.env.PORT === '7860';

const generateTokenAndSetCookie = (res: express.Response, user: any) => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );

  res.cookie('token', token, {
    httpOnly: true,
    secure: isDeployed,            // required for SameSite=None
    sameSite: isDeployed ? 'none' : 'lax', // cross-site (vercel → hf.space) needs None
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// Email/password login with rate limiting
router.post('/login', authLimiter, async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const hash = crypto.createHash('sha256').update(password).digest('hex');
    if (hash !== user.passwordHash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    generateTokenAndSetCookie(res, user);
    
    // Return sanitized user details
    res.json({
      message: 'Logged in successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        xp: user.xp,
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// Logout endpoint (clears cookie)
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: isDeployed,
    sameSite: isDeployed ? 'none' : 'lax',
  });
  res.json({ message: 'Logged out successfully' });
});

// Current session validation
router.get('/me', requireAuth, (req: AuthRequest, res) => {
  res.json({ user: req.user });
});

// Sync/complete user profile details (department selection, roll number, year, branch)
router.post('/sync-profile', requireAuth, async (req: AuthRequest, res) => {
  const { department, year, branch, githubHandle } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (department) user.department = department;
    if (year) user.year = Number(year);
    if (branch) user.branch = branch;
    if (githubHandle !== undefined) user.githubHandle = githubHandle;

    await user.save();
    res.json({ message: 'Profile synchronized successfully', user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to synchronize user profile' });
  }
});

export default router;
