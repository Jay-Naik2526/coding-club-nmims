import express from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { Event, User, Registration, TeamMember, Problem, Submission, Form, FormResponse, Message } from '../models/index.js';

const router = express.Router();

// GET /admin/stats - Admin control panel aggregate numbers
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'STUDENT' });
    const totalRegistrations = await Registration.countDocuments({});
    const totalEvents = await Event.countDocuments({});
    const totalSubmissions = await Submission.countDocuments({});
    
    // Count registrants per department
    const dsaRegs = await Event.find({ department: 'dsa' });
    const webRegs = await Event.find({ department: 'web' });
    const secRegs = await Event.find({ department: 'sec' });

    const dsaCount = await Registration.countDocuments({ eventId: { $in: dsaRegs.map(e => e._id) } });
    const webCount = await Registration.countDocuments({ eventId: { $in: webRegs.map(e => e._id) } });
    const secCount = await Registration.countDocuments({ eventId: { $in: secRegs.map(e => e._id) } });

    res.json({
      users: totalUsers,
      registrations: totalRegistrations,
      events: totalEvents,
      submissions: totalSubmissions,
      distribution: {
        dsa: dsaCount,
        web: webCount,
        sec: secCount
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to compile stats' });
  }
});

// GET /admin/registrations - Retrieve all student registrations
router.get('/registrations', requireAdmin, async (req, res) => {
  try {
    const registrations = await Registration.find({})
      .populate('userId', 'name email department branch year githubHandle')
      .populate('eventId', 'title slug department type')
      .sort({ createdAt: -1 });

    const processed = [];
    for (const reg of registrations) {
      const regObj = reg.toObject() as any;
      if (reg.teamName) {
        const members = await TeamMember.find({ registrationId: reg._id })
          .populate('userId', 'name email department branch year githubHandle');
        regObj.teamMembers = members.map(m => m.userId);
      }
      processed.push(regObj);
    }

    res.json(processed);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve registrations' });
  }
});

// GET /admin/forms - List all dynamic forms
router.get('/forms', requireAdmin, async (req, res) => {
  try {
    const forms = await Form.find({}).populate('eventId', 'title slug').sort({ createdAt: -1 });
    res.json(forms);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list forms' });
  }
});

// POST /admin/forms - Create a new dynamic questionnaire form
router.post('/forms', requireAdmin, async (req: any, res) => {
  const { title, slug, fields, eventId, isPublished } = req.body;
  if (!title || !slug || !fields || !Array.isArray(fields)) {
    return res.status(400).json({ error: 'Title, slug, and fields array are required.' });
  }

  try {
    const existing = await Form.findOne({ slug });
    if (existing) {
      return res.status(400).json({ error: 'Form with this slug already exists.' });
    }

    const form = await Form.create({
      title,
      slug,
      fields,
      eventId: eventId || undefined,
      createdBy: req.user._id,
      isPublished: isPublished ?? false
    });

    res.status(201).json(form);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// GET /admin/forms/:formId/responses - List all submissions for a questionnaire
router.get('/forms/:formId/responses', requireAdmin, async (req, res) => {
  try {
    const form = await Form.findById(req.params.formId);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    const responses = await FormResponse.find({ formId: form._id })
      .populate('userId', 'name email department branch year')
      .sort({ submittedAt: -1 });

    res.json({
      form,
      responses
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve responses' });
  }
});

// GET /admin/forms/:formId/export - Export questionnaire data in CSV format
router.get('/forms/:formId/export', requireAdmin, async (req, res) => {
  try {
    const form = await Form.findById(req.params.formId);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    const responses = await FormResponse.find({ formId: form._id })
      .populate('userId', 'name email department branch year');

    const fieldKeys = form.fields.map(f => f.name);
    const headers = [
      'User Name',
      'User Email',
      'Department',
      'Branch',
      'Year',
      'Submitted At',
      ...form.fields.map(f => f.label)
    ];

    const rows = [headers];
    for (const resp of responses) {
      const user = resp.userId as any;
      const row = [
        user?.name || 'Guest User',
        user?.email || 'N/A',
        user?.department || 'N/A',
        user?.branch || 'N/A',
        user?.year || 'N/A',
        resp.submittedAt.toISOString(),
        ...fieldKeys.map(k => {
          const val = resp.responseData[k];
          if (Array.isArray(val)) return val.join('; ');
          return val !== undefined ? String(val) : '';
        })
      ];
      rows.push(row);
    }

    const csvContent = rows
      .map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="form_${form.slug}_responses.csv"`);
    res.status(200).send(csvContent);
  } catch (err) {
    res.status(500).json({ error: 'Failed to compile CSV export' });
  }
});

// POST /admin/contact - Submit contact form query (Public)
router.post('/contact', async (req, res) => {
  const { fullName, sapId, campusDept, email, message } = req.body;
  if (!fullName || !sapId || !campusDept || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const newMsg = await Message.create({
      fullName,
      sapId,
      campusDept,
      email,
      message
    });
    res.status(201).json({ success: true, message: 'Message sent successfully.', data: newMsg });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit contact message.' });
  }
});

// GET /admin/messages - Retrieve all contact submissions (Admin guarded)
router.get('/messages', requireAdmin, async (req, res) => {
  try {
    const messages = await Message.find({}).sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve contact queries.' });
  }
});

export default router;
