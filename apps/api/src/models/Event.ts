import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  slug: string;
  title: string;
  description: string;
  department: 'dsa' | 'web' | 'sec';
  type: 'SOLO' | 'TEAM';
  minTeamSize: number;
  maxTeamSize: number;
  startDate: Date;
  endDate: Date;
  registrationDeadline: Date;
  status: 'open' | 'live' | 'upcoming' | 'closed';
  difficulty: number;
  bannerUrl?: string;
  createdAt: Date;
  /** Draft events exist in the DB (so the site is "ready") but are hidden
   *  from every public route until an admin flips this to true. */
  isPublished: boolean;
}

const EventSchema = new Schema<IEvent>({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  department: { type: String, enum: ['dsa', 'web', 'sec'], required: true },
  type: { type: String, enum: ['SOLO', 'TEAM'], required: true },
  minTeamSize: { type: Number, default: 1 },
  maxTeamSize: { type: Number, default: 1 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  registrationDeadline: { type: Date, required: true },
  status: { type: String, enum: ['open', 'live', 'upcoming', 'closed'], default: 'upcoming' },
  difficulty: { type: Number, required: true, min: 1, max: 5 },
  bannerUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
  isPublished: { type: Boolean, default: true },
});

export const Event = mongoose.model<IEvent>('Event', EventSchema);
export default Event;
