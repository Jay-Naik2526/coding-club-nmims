import express from 'express';
import { Event, Problem } from '../models/index.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

const checkEventStatus = (event: any) => {
  const doc = event.toObject ? event.toObject() : event;
  const now = new Date();
  if (doc.status !== 'closed' && doc.status !== 'live' && new Date(doc.registrationDeadline) < now) {
    doc.status = 'closed';
  }
  return doc;
};

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ startDate: -1 });
    const processed = events.map(checkEventStatus);
    res.json(processed);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve events' });
  }
});

// Get event by slug
router.get('/:slug', async (req, res) => {
  try {
    const event = await Event.findOne({ slug: req.params.slug });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(checkEventStatus(event));
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve event' });
  }
});

// Get all problems for an event slug (hides secret test cases)
router.get('/:slug/problems', async (req, res) => {
  try {
    const event = await Event.findOne({ slug: req.params.slug });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    const problems = await Problem.find({ eventId: event._id }).select('-testCases');
    res.json(problems);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve problems' });
  }
});

// Admin-only: Create Event
router.post('/', requireAdmin, async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// Admin-only: Update Event
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// Admin-only: Delete Event
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

export default router;
