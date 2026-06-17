import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Form, FormResponse, User } from '../models/index.js';

const router = express.Router();

// GET /forms/:slug - Fetch a published form questionnaire
router.get('/:slug', async (req, res) => {
  try {
    const form = await Form.findOne({ slug: req.params.slug, isPublished: true }).populate('eventId', 'title');
    if (!form) {
      return res.status(404).json({ error: 'Questionnaire form not found or unpublished.' });
    }
    res.json(form);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve questionnaire form' });
  }
});

// POST /forms/:slug/submit - Submit response data
router.post('/:slug/submit', requireAuth, async (req: any, res) => {
  const { responseData } = req.body;
  if (!responseData) {
    return res.status(400).json({ error: 'Response data is required.' });
  }

  try {
    const form = await Form.findOne({ slug: req.params.slug, isPublished: true });
    if (!form) {
      return res.status(404).json({ error: 'Questionnaire form not found.' });
    }

    // Check duplicate response
    const existing = await FormResponse.findOne({ formId: form._id, userId: req.user._id });
    if (existing) {
      return res.status(400).json({ error: 'You have already submitted a response for this form.' });
    }

    // Basic validation of fields
    for (const field of form.fields) {
      if (field.required && (responseData[field.name] === undefined || responseData[field.name] === '')) {
        return res.status(400).json({ error: `Field "${field.label}" is required.` });
      }
    }

    // Record response
    const response = await FormResponse.create({
      formId: form._id,
      userId: req.user._id,
      responseData,
      submittedAt: new Date()
    });

    // Gamified incentive: award 50 XP to the user for completing surveys/forms
    await User.findByIdAndUpdate(req.user._id, { $inc: { xp: 50 } });

    res.json({
      success: true,
      message: 'Form response submitted successfully. +50 XP awarded!',
      response
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message || 'Failed to submit form response' });
  }
});

export default router;
