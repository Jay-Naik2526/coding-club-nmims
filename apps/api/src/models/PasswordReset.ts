import mongoose, { Schema, Document } from 'mongoose';

export interface IPasswordReset extends Document {
  userId: mongoose.Types.ObjectId;
  email: string;
  sapId: string;
  status: 'pending' | 'approved' | 'rejected' | 'used';
  resetToken?: string;
  expiresAt?: Date;
  createdAt: Date;
}

const PasswordResetSchema = new Schema<IPasswordReset>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  email: { type: String, required: true },
  sapId: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'used'], default: 'pending' },
  resetToken: { type: String },
  expiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export const PasswordReset = mongoose.model<IPasswordReset>('PasswordReset', PasswordResetSchema);
export default PasswordReset;
