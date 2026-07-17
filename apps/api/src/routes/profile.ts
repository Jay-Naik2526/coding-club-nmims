import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Registration, CTFSolve, Submission, FormResponse, UserBadge } from '../models/index.js';

const router = express.Router();

// GET /profile - Get current user profile details, registrations, achievements, and activity map
router.get('/', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user._id;

    // 1. Fetch user registrations populated with Event details
    const registrations = await Registration.find({ userId })
      .populate('eventId')
      .sort({ createdAt: -1 });

    // 2. Fetch CTF solves populated with challenge and event details
    const solves = await CTFSolve.find({ userId })
      .populate({
        path: 'challengeId',
        populate: { path: 'eventId', select: 'title slug' },
      })
      .sort({ solvedAt: -1 });

    // 3. Fetch submissions populated with Problem and Event details
    const submissions = await Submission.find({ userId })
      .populate({
        path: 'problemId',
        select: 'title difficulty',
        populate: { path: 'eventId', select: 'title slug' },
      })
      .sort({ createdAt: -1 });

    // 4. Fetch earned badges
    const badges = await UserBadge.find({ userId })
      .populate('badgeId')
      .sort({ earnedAt: -1 });

    // 5. Gather form response completions
    const formResponses = await FormResponse.find({ userId })
      .populate('formId', 'title')
      .sort({ submittedAt: -1 });

    // 6. Compile 365-day contribution/activity heatmap data
    const activityMap: Record<string, number> = {};

    const addActivity = (date: Date) => {
      if (!date) return;
      const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
      activityMap[dateString] = (activityMap[dateString] || 0) + 1;
    };

    // Aggregate dates from all student interactions
    registrations.forEach((r) => addActivity(r.createdAt));
    solves.forEach((s) => addActivity(s.solvedAt));
    submissions.forEach((sub) => addActivity(sub.createdAt));
    formResponses.forEach((fr) => addActivity(fr.submittedAt));
    badges.forEach((b) => addActivity(b.earnedAt));

    res.json({
      user: req.user,
      registrations,
      solves,
      submissions,
      badges,
      activity: activityMap,
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message || 'Failed to retrieve profile dossier' });
  }
});

export default router;
