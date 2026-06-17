import express from 'express';
import { Resend } from 'resend';
import { Event, User, Registration, TeamMember } from '../models/index.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { generateTicketPdf } from '../utils/ticket.js';

const router = express.Router();

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Send pass PDF via email using Resend
const sendTicketEmail = async (user: any, event: any, pdfBuffer: Buffer) => {
  if (!resend) {
    console.warn('Resend API key is missing. Skipping ticket email dispatch.');
    return;
  }
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Coding Club NMIMS <onboarding@resend.dev>',
      to: user.email,
      subject: `Pass Confirmation: ${event.title}`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; padding: 20px; border: 1px solid #eee; background: #faf9f7;">
          <h2 style="color: #e00000; border-bottom: 2px solid #111; padding-bottom: 10px;">CODING CLUB NMIMS</h2>
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>Your entry registration for <strong>${event.title}</strong> has been successfully confirmed!</p>
          <p><strong>Date:</strong> ${new Date(event.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <p><strong>Time:</strong> ${new Date(event.startDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
          <p>Your official PDF ticket pass has been attached. Please present the QR code on arrival at the venue.</p>
          <br />
          <p>Best regards,<br/><strong>Coding Club MPSTME, Shirpur</strong></p>
        </div>
      `,
      attachments: [
        {
          filename: `${event.slug}-pass.pdf`,
          content: pdfBuffer,
        },
      ],
    });
    console.log(`Ticket email sent successfully to ${user.email}`);
  } catch (err) {
    console.error(`Failed to send email to ${user.email}:`, err);
  }
};

// Register for an event (handles both SOLO and TEAM registrations)
router.post('/:slug/register', requireAuth, async (req: AuthRequest, res) => {
  const { slug } = req.params;
  const { teamName, memberEmails } = req.body;
  const leader = req.user;

  try {
    const event = await Event.findOne({ slug });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const now = new Date();
    if (new Date(event.registrationDeadline) < now) {
      return res.status(400).json({ error: 'Registration window has closed' });
    }

    if (event.status === 'closed') {
      return res.status(400).json({ error: 'Registration is closed' });
    }

    // 1. SOLO Registration Flow
    if (event.type === 'SOLO') {
      // Check if already registered
      const existing = await Registration.findOne({ userId: leader._id, eventId: event._id });
      if (existing) {
        return res.status(400).json({ error: 'You are already registered for this event' });
      }

      // Create Registration
      const registration = await Registration.create({
        userId: leader._id,
        eventId: event._id,
        status: 'registered',
      });

      // Generate Pass PDF and Send Email
      const pdfBuffer = await generateTicketPdf(registration, event, leader);
      await sendTicketEmail(leader, event, pdfBuffer);

      return res.status(201).json({
        message: 'Registered successfully',
        registration,
      });
    }

    // 2. TEAM Registration Flow
    if (event.type === 'TEAM') {
      if (!teamName || !teamName.trim()) {
        return res.status(400).json({ error: 'Team name is required' });
      }

      const emails: string[] = Array.isArray(memberEmails) ? memberEmails : [];
      const totalSize = emails.length + 1; // Members + Leader

      if (totalSize < event.minTeamSize || totalSize > event.maxTeamSize) {
        return res.status(400).json({
          error: `Team size must be between ${event.minTeamSize} and ${event.maxTeamSize} members. Current: ${totalSize}`,
        });
      }

      // Check if leader is already registered
      const leaderExistingReg = await Registration.findOne({ userId: leader._id, eventId: event._id });
      const leaderExistingMember = await TeamMember.findOne({ userId: leader._id }).populate({
        path: 'registrationId',
        match: { eventId: event._id },
      });
      
      const isLeaderRegistered = leaderExistingReg || (leaderExistingMember && leaderExistingMember.registrationId);
      if (isLeaderRegistered) {
        return res.status(400).json({ error: 'You are already registered for this event' });
      }

      // Resolve member emails
      const members = [];
      const unregisteredEmails = [];

      for (const email of emails) {
        const user = await User.findOne({ email: email.trim() });
        if (!user) {
          unregisteredEmails.push(email);
        } else {
          members.push(user);
        }
      }

      if (unregisteredEmails.length > 0) {
        return res.status(400).json({
          error: `Unregistered team members found (they must sign up first): ${unregisteredEmails.join(', ')}`,
        });
      }

      // Check if any member is already registered for this event
      const registeredMembers = [];
      for (const member of members) {
        const reg = await Registration.findOne({ userId: member._id, eventId: event._id });
        const mem = await TeamMember.findOne({ userId: member._id }).populate({
          path: 'registrationId',
          match: { eventId: event._id },
        });
        
        if (reg || (mem && mem.registrationId)) {
          registeredMembers.push(member.name);
        }
      }

      if (registeredMembers.length > 0) {
        return res.status(400).json({
          error: `The following members are already registered for this event: ${registeredMembers.join(', ')}`,
        });
      }

      // Create primary team Registration linked to leader
      const registration = await Registration.create({
        userId: leader._id,
        eventId: event._id,
        teamName: teamName.trim(),
        status: 'registered',
      });

      // Create TeamMember mapping records
      await TeamMember.create({
        registrationId: registration._id,
        userId: leader._id,
        isLeader: true,
      });

      for (const member of members) {
        await TeamMember.create({
          registrationId: registration._id,
          userId: member._id,
          isLeader: false,
        });
      }

      // Generate Ticket and Email pass to all members
      const allTeamUsers = [leader, ...members];
      const pdfBuffer = await generateTicketPdf(registration, event, leader, allTeamUsers);

      for (const user of allTeamUsers) {
        await sendTicketEmail(user, event, pdfBuffer);
      }

      return res.status(201).json({
        message: 'Team registered successfully',
        registration,
        teamSize: totalSize,
      });
    }

    res.status(400).json({ error: 'Invalid event configuration type' });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message || 'Failed to complete registration' });
  }
});

// Download/retrieve ticket pass PDF directly
router.get('/:id/ticket', requireAuth, async (req: AuthRequest, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    // Check if the requesting user belongs to this registration (leader or member)
    const isLeader = String(registration.userId) === String(req.user._id);
    let isMember = false;

    if (registration.teamName) {
      const memberRecord = await TeamMember.findOne({
        registrationId: registration._id,
        userId: req.user._id,
      });
      if (memberRecord) {
        isMember = true;
      }
    }

    if (!isLeader && !isMember && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied: You do not own this entry pass' });
    }

    const event = await Event.findById(registration.eventId);
    const user = await User.findById(registration.userId); // pass owner (leader)
    
    if (!event || !user) {
      return res.status(404).json({ error: 'Event or User records not found' });
    }

    // Resolve team members to print on pass
    let teamUsers: any[] = [];
    if (registration.teamName) {
      const mappings = await TeamMember.find({ registrationId: registration._id });
      const userIds = mappings.map(m => m.userId);
      teamUsers = await User.find({ _id: { $in: userIds } });
    }

    const pdfBuffer = await generateTicketPdf(registration, event, user, teamUsers);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${event.slug}-pass.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate ticket download' });
  }
});

// Get all registrations for currently logged-in user
router.get('/my-registrations', requireAuth, async (req: AuthRequest, res) => {
  try {
    // Registrations where user is the registrant (solo or team leader)
    const primaryRegs = await Registration.find({ userId: req.user._id }).populate('eventId');
    
    // Registrations where user is a team member
    const teamMappings = await TeamMember.find({ userId: req.user._id, isLeader: false });
    const teamRegIds = teamMappings.map(m => m.registrationId);
    const memberRegs = await Registration.find({ _id: { $in: teamRegIds } }).populate('eventId');
    
    // Combine and mark if leader or member
    const combined = [
      ...primaryRegs.map(r => ({ ...r.toObject(), isLeader: true })),
      ...memberRegs.map(r => ({ ...r.toObject(), isLeader: false }))
    ];

    res.json(combined);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve registrations' });
  }
});

export default router;
