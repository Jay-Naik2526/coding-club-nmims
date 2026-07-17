import mongoose, { Schema, Document } from 'mongoose';

export interface ISubmission extends Document {
  userId: mongoose.Types.ObjectId;
  problemId: mongoose.Types.ObjectId;
  code: string;
  language: string;
  verdict: 'AC' | 'WA' | 'TLE' | 'RE' | 'PENDING';
  runtime: number; // in milliseconds
  memory: number; // in KB
  createdAt: Date;
}

const SubmissionSchema = new Schema<ISubmission>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  problemId: { type: Schema.Types.ObjectId, ref: 'Problem', required: true },
  code: { type: String, required: true },
  language: { type: String, required: true },
  verdict: { type: String, enum: ['AC', 'WA', 'TLE', 'RE', 'PENDING'], default: 'PENDING' },
  runtime: { type: Number, default: 0 },
  memory: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export const Submission = mongoose.model<ISubmission>('Submission', SubmissionSchema);
export default Submission;
