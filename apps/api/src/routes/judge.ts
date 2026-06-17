import express from 'express';
import { Problem, Submission, User, Badge, UserBadge } from '../models/index.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { runCodeOnJudge0, decodeBase64 } from '../utils/judge.js';

const router = express.Router();

// 1. Run code against custom stdin
router.post('/run', async (req, res) => {
  const { code, language, stdin } = req.body;

  if (!code || !language) {
    return res.status(400).json({ error: 'Code and language are required' });
  }

  try {
    const result = await runCodeOnJudge0(code, language, stdin || '');
    
    // Decode stdout if present
    const output = result.stdout ? decodeBase64(result.stdout) : '';
    const errorOutput = result.stderr ? decodeBase64(result.stderr) : '';
    const compileOutput = result.compile_output ? decodeBase64(result.compile_output) : '';

    res.json({
      verdict: result.status.description,
      time: result.time,
      memory: result.memory,
      stdout: output,
      stderr: errorOutput,
      compile_output: compileOutput,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to run code' });
  }
});

// 2. Submit code against hidden test cases
router.post('/submit', requireAuth, async (req: AuthRequest, res) => {
  const { problemId, code, language } = req.body;
  const user = req.user;

  if (!problemId || !code || !language) {
    return res.status(400).json({ error: 'ProblemId, code, and language are required' });
  }

  try {
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: 'Problem specification not found' });
    }

    let finalVerdict: 'AC' | 'WA' | 'TLE' | 'RE' = 'AC';
    let maxTime = 0;
    let maxMemory = 0;
    let failedTestCaseIndex = -1;

    // Run against all test cases
    for (let i = 0; i < problem.testCases.length; i++) {
      const tc = problem.testCases[i];
      const result = await runCodeOnJudge0(code, language, tc.input, tc.output);

      const stdoutText = result.stdout ? decodeBase64(result.stdout).trim() : '';
      const expectedText = tc.output.trim();

      const runTime = Number(result.time) * 1000; // convert to ms
      maxTime = Math.max(maxTime, runTime);
      maxMemory = Math.max(maxMemory, Number(result.memory));

      // Check status ID (3 is Accepted)
      if (result.status.id === 5) {
        finalVerdict = 'TLE';
        failedTestCaseIndex = i;
        break;
      } else if (result.status.id === 6 || result.status.id === 7 || result.status.id === 8 || result.status.id === 9 || result.status.id === 10 || result.status.id === 11 || result.status.id === 12) {
        finalVerdict = 'RE';
        failedTestCaseIndex = i;
        break;
      } else if (stdoutText !== expectedText) {
        finalVerdict = 'WA';
        failedTestCaseIndex = i;
        break;
      }
    }

    // Save Submission record in DB
    const submission = await Submission.create({
      userId: user._id,
      problemId: problem._id,
      code,
      language,
      verdict: finalVerdict,
      runtime: maxTime,
      memory: maxMemory,
    });

    let xpAwarded = 0;
    let badgeEarned = null;

    if (finalVerdict === 'AC') {
      // Award XP based on difficulty
      xpAwarded = 100 * problem.difficulty;
      
      const dbUser = await User.findById(user._id);
      if (dbUser) {
        dbUser.xp += xpAwarded;
        await dbUser.save();
        
        // Gamification: check for Badge award criteria
        // Algorithm Master badge for 10 Accepted submissions
        const acCount = await Submission.countDocuments({ userId: user._id, verdict: 'AC' });
        if (acCount >= 10) {
          const algoBadge = await Badge.findOne({ name: 'Algorithm Master' });
          if (algoBadge) {
            const existingUserBadge = await UserBadge.findOne({ userId: user._id, badgeId: algoBadge._id });
            if (!existingUserBadge) {
              await UserBadge.create({ userId: user._id, badgeId: algoBadge._id });
              badgeEarned = algoBadge.name;
            }
          }
        }
      }

      // Broadcast Socket.io update event for live standing leaderboard updates
      const io = req.app.get('io');
      if (io) {
        io.emit('submission_update', {
          userId: user._id,
          userName: user.name,
          userXP: user.xp + xpAwarded,
          problemTitle: problem.title,
          verdict: 'AC',
        });
      }
    }

    res.status(201).json({
      submission,
      xpAwarded,
      badgeEarned,
      failedTestCaseIndex: finalVerdict === 'AC' ? undefined : failedTestCaseIndex,
    });

  } catch (err) {
    res.status(500).json({ error: (err as Error).message || 'Failed to grade submission' });
  }
});

export default router;
