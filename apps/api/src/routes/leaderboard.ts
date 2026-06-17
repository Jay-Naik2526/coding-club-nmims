import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Event, User, Registration, TeamMember, Problem, Submission, CTFChallenge, CTFSolve } from '../models/index.js';

const router = express.Router();

// GET /leaderboard/global - Global overall user XP leaderboard
router.get('/global', async (req, res) => {
  try {
    const users = await User.find({ role: 'STUDENT' })
      .select('name email department branch year githubHandle xp')
      .sort({ xp: -1 })
      .limit(100);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve global leaderboard' });
  }
});

// GET /leaderboard/event/:eventIdOrSlug - Standings for a specific event
router.get('/event/:eventIdOrSlug', async (req, res) => {
  const { eventIdOrSlug } = req.params;

  try {
    // 1. Find event
    let event = await Event.findOne({ slug: eventIdOrSlug });
    if (!event) {
      try {
        event = await Event.findById(eventIdOrSlug);
      } catch (e) {
        // Not a valid ObjectId and no slug match
      }
    }

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const isCtf = event.department === 'sec';

    // 2. Fetch all registered entities
    const registrations = await Registration.find({ eventId: event._id }).populate('userId', 'name email department branch year githubHandle');

    // 3. SOLO event leaderboard calculation
    if (event.type === 'SOLO') {
      const userScores: Record<string, { user: any; score: number; lastSolvedAt: Date; solvedCount: number }> = {};

      // Initialize all registered users with 0 points
      for (const reg of registrations) {
        if (reg.userId) {
          const userObj = reg.userId as any;
          userScores[userObj._id.toString()] = {
            user: userObj,
            score: 0,
            lastSolvedAt: new Date(0),
            solvedCount: 0,
          };
        }
      }

      if (isCtf) {
        // CTF Event
        const challenges = await CTFChallenge.find({ eventId: event._id });
        const challengeIds = challenges.map((c) => c._id);
        const solves = await CTFSolve.find({ challengeId: { $in: challengeIds } });

        for (const solve of solves) {
          const uId = solve.userId.toString();
          if (userScores[uId]) {
            userScores[uId].score += solve.pointsAwarded;
            userScores[uId].solvedCount += 1;
            if (solve.solvedAt > userScores[uId].lastSolvedAt) {
              userScores[uId].lastSolvedAt = solve.solvedAt;
            }
          }
        }
      } else {
        // DSA Event
        const problems = await Problem.find({ eventId: event._id });
        const problemIds = problems.map((p) => p._id);
        const submissions = await Submission.find({ problemId: { $in: problemIds }, verdict: 'AC' });

        // track unique problem solves per user
        const solvedTrack = new Set<string>();

        for (const sub of submissions) {
          const uId = sub.userId.toString();
          const pId = sub.problemId.toString();
          const trackKey = `${uId}_${pId}`;

          if (userScores[uId] && !solvedTrack.has(trackKey)) {
            solvedTrack.add(trackKey);
            const prob = problems.find((p) => p._id.toString() === pId);
            const difficulty = prob ? prob.difficulty : 1;
            const points = difficulty * 100;

            userScores[uId].score += points;
            userScores[uId].solvedCount += 1;
            if (sub.createdAt > userScores[uId].lastSolvedAt) {
              userScores[uId].lastSolvedAt = sub.createdAt;
            }
          }
        }
      }

      // Convert to array and sort
      const standings = Object.values(userScores).sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        // Tie-breaker: earlier completion
        if (a.lastSolvedAt.getTime() === 0 && b.lastSolvedAt.getTime() === 0) return 0;
        if (a.lastSolvedAt.getTime() === 0) return 1;
        if (b.lastSolvedAt.getTime() === 0) return -1;
        return a.lastSolvedAt.getTime() - b.lastSolvedAt.getTime();
      });

      return res.json({ type: 'SOLO', standings });
    }

    // 4. TEAM event leaderboard calculation
    if (event.type === 'TEAM') {
      const teamScores: Record<string, { registrationId: string; teamName: string; leader: any; members: any[]; score: number; lastSolvedAt: Date; solvedCount: number }> = {};

      // Initialize teams and map users to team registration IDs
      const userToTeamMap: Record<string, string> = {};

      for (const reg of registrations) {
        if (reg.teamName) {
          const regIdStr = reg._id.toString();
          
          // Get members
          const mappings = await TeamMember.find({ registrationId: reg._id }).populate('userId', 'name email department branch year githubHandle');
          const membersList = mappings.map((m) => m.userId as any);
          
          // Find leader
          const leaderMapping = mappings.find((m) => m.isLeader);
          const leaderObj = leaderMapping ? leaderMapping.userId : reg.userId;

          teamScores[regIdStr] = {
            registrationId: regIdStr,
            teamName: reg.teamName,
            leader: leaderObj,
            members: membersList,
            score: 0,
            lastSolvedAt: new Date(0),
            solvedCount: 0,
          };

          for (const mem of membersList) {
            if (mem) {
              userToTeamMap[mem._id.toString()] = regIdStr;
            }
          }
        }
      }

      if (isCtf) {
        // CTF Event
        const challenges = await CTFChallenge.find({ eventId: event._id });
        const challengeIds = challenges.map((c) => c._id);
        const solves = await CTFSolve.find({ challengeId: { $in: challengeIds } });

        // Track challenges solved by teams to avoid duplicate points
        const teamSolvedChallenges = new Set<string>();

        for (const solve of solves) {
          const uId = solve.userId.toString();
          const teamId = userToTeamMap[uId];
          const chalId = solve.challengeId.toString();
          const solveKey = `${teamId}_${chalId}`;

          if (teamId && teamScores[teamId] && !teamSolvedChallenges.has(solveKey)) {
            teamSolvedChallenges.add(solveKey);
            teamScores[teamId].score += solve.pointsAwarded;
            teamScores[teamId].solvedCount += 1;
            if (solve.solvedAt > teamScores[teamId].lastSolvedAt) {
              teamScores[teamId].lastSolvedAt = solve.solvedAt;
            }
          }
        }
      } else {
        // DSA Event
        const problems = await Problem.find({ eventId: event._id });
        const problemIds = problems.map((p) => p._id);
        const submissions = await Submission.find({ problemId: { $in: problemIds }, verdict: 'AC' });

        // track unique problem solves per team
        const teamSolvedProblems = new Set<string>();

        for (const sub of submissions) {
          const uId = sub.userId.toString();
          const teamId = userToTeamMap[uId];
          const pId = sub.problemId.toString();
          const solveKey = `${teamId}_${pId}`;

          if (teamId && teamScores[teamId] && !teamSolvedProblems.has(solveKey)) {
            teamSolvedProblems.add(solveKey);
            const prob = problems.find((p) => p._id.toString() === pId);
            const difficulty = prob ? prob.difficulty : 1;
            const points = difficulty * 100;

            teamScores[teamId].score += points;
            teamScores[teamId].solvedCount += 1;
            if (sub.createdAt > teamScores[teamId].lastSolvedAt) {
              teamScores[teamId].lastSolvedAt = sub.createdAt;
            }
          }
        }
      }

      // Convert to array and sort
      const standings = Object.values(teamScores).sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        // Tie-breaker: earlier completion
        if (a.lastSolvedAt.getTime() === 0 && b.lastSolvedAt.getTime() === 0) return 0;
        if (a.lastSolvedAt.getTime() === 0) return 1;
        if (b.lastSolvedAt.getTime() === 0) return -1;
        return a.lastSolvedAt.getTime() - b.lastSolvedAt.getTime();
      });

      return res.json({ type: 'TEAM', standings });
    }

    res.status(400).json({ error: 'Invalid event type configuration' });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message || 'Failed to retrieve event leaderboard' });
  }
});

export default router;
