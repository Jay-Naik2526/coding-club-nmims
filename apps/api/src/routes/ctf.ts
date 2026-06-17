import express from 'express';
import crypto from 'crypto';
import { requireAuth } from '../middleware/auth.js';
import { Event, CTFChallenge, CTFSolve, User, Badge, UserBadge } from '../models/index.js';

const router = express.Router();

// Cooldown map: userId_challengeId -> timestamp
const lastAttempts = new Map<string, number>();

// Helper to hash flag
const hashFlag = (flag: string) => {
  return crypto.createHash('sha256').update(flag.trim()).digest('hex');
};

// GET /ctf/:slug/challenges - Retrieve event challenges (without flag hashes)
router.get('/:slug/challenges', requireAuth, async (req: any, res) => {
  try {
    const event = await Event.findOne({ slug: req.params.slug });
    if (!event) {
      return res.status(404).json({ error: 'CTF Event not found' });
    }

    // Allow viewing challenges if event is live or closed (not upcoming)
    const now = new Date();
    if (event.status === 'upcoming' && now < event.startDate) {
      return res.status(403).json({ error: 'CTF challenges are not available yet.' });
    }

    // Retrieve challenges and exclude flagHash
    const challenges = await CTFChallenge.find({ eventId: event._id }).select('-flagHash');

    // Retrieve solves for the current user
    const solves = await CTFSolve.find({
      userId: req.user._id,
      challengeId: { $in: challenges.map((c) => c._id) },
    });

    const solvedChallengeIds = new Set(solves.map((s) => s.challengeId.toString()));

    const processedChallenges = challenges.map((challenge) => {
      const doc = challenge.toObject();
      return {
        ...doc,
        solved: solvedChallengeIds.has(challenge._id.toString()),
      };
    });

    res.json(processedChallenges);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve CTF challenges' });
  }
});

// POST /ctf/:slug/submit - Submit flag for validation
router.post('/:slug/submit', requireAuth, async (req: any, res) => {
  const { challengeId, flag } = req.body;
  if (!challengeId || !flag) {
    return res.status(400).json({ error: 'Challenge ID and Flag are required.' });
  }

  const userId = req.user._id.toString();
  const cooldownKey = `${userId}_${challengeId}`;
  const now = Date.now();

  // Cooldown check (5 seconds)
  if (lastAttempts.has(cooldownKey)) {
    const lastTime = lastAttempts.get(cooldownKey) || 0;
    if (now - lastTime < 5000) {
      return res.status(429).json({ error: 'Please wait 5 seconds between flag submissions.' });
    }
  }
  lastAttempts.set(cooldownKey, now);

  try {
    const challenge = await CTFChallenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ error: 'CTF Challenge not found' });
    }

    const event = await Event.findById(challenge.eventId);
    if (!event) {
      return res.status(404).json({ error: 'Associated event not found' });
    }

    // Enforce that flag submissions are only during live event
    if (event.status !== 'live' && (now < event.startDate.getTime() || now > event.endDate.getTime())) {
      return res.status(400).json({ error: 'Flag submissions are only allowed during the live event.' });
    }

    // Check if user has already solved this challenge
    const existingSolve = await CTFSolve.findOne({ userId: req.user._id, challengeId });
    if (existingSolve) {
      return res.status(400).json({ error: 'You have already solved this challenge.' });
    }

    // Verify flag
    const submittedHash = hashFlag(flag);
    if (submittedHash !== challenge.flagHash) {
      return res.json({ correct: false, error: 'Incorrect flag. Check casing and try again!' });
    }

    // Correct flag: create solve entry
    const solve = await CTFSolve.create({
      userId: req.user._id,
      challengeId: challenge._id,
      pointsAwarded: challenge.points,
      solvedAt: new Date(),
    });

    // Award XP to user
    await User.findByIdAndUpdate(req.user._id, { $inc: { xp: challenge.points } });

    // Check for "First Blood" badge (first person to solve this challenge overall)
    const totalSolves = await CTFSolve.countDocuments({ challengeId: challenge._id });
    let awardedFirstBlood = false;
    if (totalSolves === 1) {
      const firstBloodBadge = await Badge.findOne({ name: 'First Blood' });
      if (firstBloodBadge) {
        const badgeExists = await UserBadge.findOne({ userId: req.user._id, badgeId: firstBloodBadge._id });
        if (!badgeExists) {
          await UserBadge.create({
            userId: req.user._id,
            badgeId: firstBloodBadge._id,
            earnedAt: new Date(),
          });
          awardedFirstBlood = true;
        }
      }
    }

    // Broadcast live leaderboard update via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('leaderboard_update', { eventId: event._id });
      // Broadcast flag solve notification
      io.emit('challenge_solved', {
        userName: req.user.name,
        challengeTitle: challenge.title,
        points: challenge.points,
        firstBlood: totalSolves === 1,
      });
    }

    res.json({
      correct: true,
      points: challenge.points,
      firstBlood: totalSolves === 1,
      badgeAwarded: awardedFirstBlood ? 'First Blood' : null,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to process flag submission' });
  }
});

export default router;
