import mongoose, { Schema, Document } from 'mongoose';

export interface IRegistration extends Document {
  userId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  teamName?: string;
  status: string;
  createdAt: Date;
  /** Set by an admin's QR scan at the door — see POST /admin/scan. */
  attended: boolean;
  attendedAt?: Date;
}

const RegistrationSchema = new Schema<IRegistration>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  teamName: { type: String },
  status: { type: String, default: 'registered' },
  createdAt: { type: Date, default: Date.now },
  attended: { type: Boolean, default: false },
  attendedAt: { type: Date },
});

export const Registration = mongoose.model<IRegistration>('Registration', RegistrationSchema);
export default Registration;
