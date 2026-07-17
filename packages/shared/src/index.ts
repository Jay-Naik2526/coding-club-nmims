import { z } from 'zod';

// Department definition
export const DEPT_IDS = ['dsa', 'web', 'sec'] as const;
export type DeptId = typeof DEPT_IDS[number];

// Roles
export const USER_ROLES = ['STUDENT', 'ADMIN'] as const;
export type UserRole = typeof USER_ROLES[number];

// Event status and type
export const EVENT_STATUSES = ['open', 'live', 'upcoming', 'closed'] as const;
export type EventStatus = typeof EVENT_STATUSES[number];

export const EVENT_TYPES = ['SOLO', 'TEAM'] as const;
export type EventType = typeof EVENT_TYPES[number];

// Verdicts for judge
export const SUBMISSION_VERDICTS = ['AC', 'WA', 'TLE', 'RE', 'PENDING'] as const;
export type SubmissionVerdict = typeof SUBMISSION_VERDICTS[number];

// User Schemas & Types
export const UserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  image: z.string().url().optional(),
  department: z.enum(DEPT_IDS),
  year: z.number().int().min(1).max(4),
  branch: z.string().min(2, 'Branch name is required'),
  githubHandle: z.string().optional(),
  xp: z.number().int().nonnegative().default(0),
  role: z.enum(USER_ROLES).default('STUDENT'),
  passwordHash: z.string().optional(),
});
export type UserType = z.infer<typeof UserSchema>;

// Event Schemas & Types
export const EventSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be alphanumeric with dashes'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string(),
  department: z.enum(DEPT_IDS),
  type: z.enum(EVENT_TYPES),
  minTeamSize: z.number().int().min(1).default(1),
  maxTeamSize: z.number().int().min(1).default(1),
  startDate: z.string(),
  endDate: z.string(),
  registrationDeadline: z.string(),
  status: z.enum(EVENT_STATUSES).default('upcoming'),
  difficulty: z.number().int().min(1).max(5),
  bannerUrl: z.string().url().optional(),
});
export type EventTypeModel = z.infer<typeof EventSchema>;

// Registration Schemas & Types
export const RegistrationSchema = z.object({
  userId: z.string(),
  eventId: z.string(),
  teamName: z.string().optional(),
  status: z.string().default('registered'),
});
export type RegistrationType = z.infer<typeof RegistrationSchema>;

// Submission Schemas & Types
export const SubmissionSchema = z.object({
  userId: z.string(),
  problemId: z.string(),
  code: z.string().min(1, 'Code cannot be empty'),
  language: z.string().min(1, 'Language is required'),
});
export type SubmissionType = z.infer<typeof SubmissionSchema>;

// CTF Challenge Submit Schema
export const CtfSubmitSchema = z.object({
  challengeId: z.string(),
  flag: z.string().min(1, 'Flag cannot be empty'),
});
export type CtfSubmitType = z.infer<typeof CtfSubmitSchema>;

// Form response Schema
export const FormResponseSchema = z.object({
  formId: z.string(),
  responseData: z.record(z.any()),
});
export type FormResponseType = z.infer<typeof FormResponseSchema>;
