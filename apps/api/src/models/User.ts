import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  image?: string;
  department: 'dsa' | 'web' | 'sec';
  year: number;
  branch: string;
  githubHandle?: string;
  xp: number;
  role: 'STUDENT' | 'ADMIN';
  passwordHash?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: { type: String },
  department: { type: String, enum: ['dsa', 'web', 'sec'], required: true },
  year: { type: Number, required: true },
  branch: { type: String, required: true },
  githubHandle: { type: String },
  xp: { type: Number, default: 0 },
  role: { type: String, enum: ['STUDENT', 'ADMIN'], default: 'STUDENT' },
  passwordHash: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.model<IUser>('User', UserSchema);
export default User;
