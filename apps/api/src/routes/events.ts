import express from 'express';
import { Event, Problem } from '../models/index.js';
import { requireAdmin, optionalAuth, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

const checkEventStatus = (event: any) => {
  const doc = event.toObject ? event.toObject() : event;
  const now = new Date();
  if (doc.status !== 'closed' && doc.status !== 'live' && new Date(doc.registrationDeadline) < now) {
    doc.status = 'closed';
  }
  return doc;
};

// Get all events. Draft (isPublished: false) events are only visible to admins
// — this is how an event can exist "ready to go" without being announced yet.
router.get('/', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const isAdmin = req.user?.role === 'ADMIN';
    const query = isAdmin ? {} : { isPublished: { $ne: false } };
    const events = await Event.find(query).sort({ startDate: -1 });
    const processed = events.map(checkEventStatus);
    res.json(processed);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve events' });
  }
});

// Get event by slug. Drafts 404 for non-admins so the URL can't be guessed.
router.get('/:slug', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const event = await Event.findOne({ slug: req.params.slug });
    const isAdmin = req.user?.role === 'ADMIN';
    if (!event || (event.isPublished === false && !isAdmin)) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(checkEventStatus(event));
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve event' });
  }
});

// Get all problems for an event slug (hides secret test cases)
router.get('/:slug/problems', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const event = await Event.findOne({ slug: req.params.slug });
    const isAdmin = req.user?.role === 'ADMIN';
    if (!event || (event.isPublished === false && !isAdmin)) {
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
// Admin-only: Update Event. Exposed as both PUT and POST /:id/update — the POST
// alias is a CORS "simple" method, so the browser sends no preflight (HF Spaces'
// proxy mishandles preflights). See apps/web/src/lib/api.ts.
const updateEvent: express.RequestHandler = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};
router.put('/:id', requireAdmin, updateEvent);
router.post('/:id/update', requireAdmin, updateEvent);

// Admin-only: Delete Event. DELETE + a POST alias (no preflight via POST).
const deleteEvent: express.RequestHandler = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
};
router.delete('/:id', requireAdmin, deleteEvent);
router.post('/:id/delete', requireAdmin, deleteEvent);

export default router;
