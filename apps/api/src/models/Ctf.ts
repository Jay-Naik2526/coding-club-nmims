import mongoose, { Schema, Document } from 'mongoose';

export interface ICTFChallenge extends Document {
  eventId: mongoose.Types.ObjectId;
  title: string;
  category: string;
  points: number;
  flagHash: string; // Salted flag hash for verification
  hints: string[];
  createdAt: Date;
}

const CTFChallengeSchema = new Schema<ICTFChallenge>({
  eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  points: { type: Number, required: true },
  flagHash: { type: String, required: true },
  hints: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

export const CTFChallenge = mongoose.model<ICTFChallenge>('CTFChallenge', CTFChallengeSchema);

export interface ICTFSolve extends Document {
  userId: mongoose.Types.ObjectId;
  challengeId: mongoose.Types.ObjectId;
  pointsAwarded: number;
  solvedAt: Date;
}

const CTFSolveSchema = new Schema<ICTFSolve>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  challengeId: { type: Schema.Types.ObjectId, ref: 'CTFChallenge', required: true },
  pointsAwarded: { type: Number, required: true },
  solvedAt: { type: Date, default: Date.now },
});

export const CTFSolve = mongoose.model<ICTFSolve>('CTFSolve', CTFSolveSchema);
