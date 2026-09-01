import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { User, PasswordReset } from '../models/index.js';
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

// Password check that supports both hash formats:
//  - bcrypt (`$2...`) — the current scheme, used by /auth/signup and re-seeding.
//  - legacy unsalted SHA-256 — from before this endpoint existed. On a
//    successful legacy match we transparently upgrade the stored hash to
//    bcrypt so every account migrates itself the next time it logs in.
const verifyPassword = async (password: string, user: any): Promise<boolean> => {
  if (!user.passwordHash) return false;
  if (user.passwordHash.startsWith('$2')) {
    return bcrypt.compare(password, user.passwordHash);
  }
  const legacyHash = crypto.createHash('sha256').update(password).digest('hex');
  if (legacyHash !== user.passwordHash) return false;
  user.passwordHash = await bcrypt.hash(password, 10);
  await user.save();
  return true;
};

// Email/password login with rate limiting
router.post('/login', authLimiter, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user || !(await verifyPassword(password, user))) {
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

// Self-service signup. Minimal fields: name, email, password, sapId, course,
// branch, year. Department defaults to 'dsa' — it only affects site theming,
// never gates event registration, so students can change it later if they want.
router.post('/signup', authLimiter, async (req, res) => {
  const { name, email, password, sapId, course, branch, year } = req.body;

  if (!name || !email || !password || !sapId || !course || !branch || !year) {
    return res.status(400).json({ error: 'All fields are required: name, email, password, SAP ID, course, branch, year' });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    const existing = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      passwordHash,
      sapId: String(sapId).trim(),
      course: String(course).trim(),
      branch: String(branch).trim(),
      year: Number(year),
      department: 'dsa',
      role: 'STUDENT',
    });

    generateTokenAndSetCookie(res, user);

    res.status(201).json({
      message: 'Account created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        xp: user.xp,
      },
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message || 'Failed to create account' });
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
  const { department, year, branch, githubHandle, sapId, course } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (department) user.department = department;
    if (year) user.year = Number(year);
    if (branch) user.branch = branch;
    if (githubHandle !== undefined) user.githubHandle = githubHandle;
    if (sapId) user.sapId = sapId;
    if (course) user.course = course;

    await user.save();
    res.json({ message: 'Profile synchronized successfully', user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to synchronize user profile' });
  }
});

// ── Self-Service Password Reset ───────────────────────────────────────────
// Student proves identity via email + SAP ID and sets a new password in one
// step — no admin approval or OTP needed.
router.post('/reset-password', authLimiter, async (req, res) => {
  const { email, sapId, newPassword } = req.body;

  if (!email || !sapId || !newPassword) {
    return res.status(400).json({ error: 'Email, SAP ID, and new password are required' });
  }
  if (String(newPassword).length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    const normalizedEmail = String(email).toLowerCase().trim();
    const normalizedSapId = String(sapId).trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email address' });
    }

    // Verify SAP ID matches (case-insensitive comparison)
    if (!user.sapId || user.sapId.toLowerCase() !== normalizedSapId.toLowerCase()) {
      return res.status(400).json({ error: 'SAP ID does not match the account on file' });
    }

    user.passwordHash = await bcrypt.hash(String(newPassword), 10);
    await user.save();

    res.json({ message: 'Password has been reset successfully. You can now log in with your new password.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

export default router;

