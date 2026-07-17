import mongoose, { Schema, Document } from 'mongoose';

export interface ITestCase {
  input: string;
  output: string;
}

export interface IProblem extends Document {
  eventId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  difficulty: number;
  sampleInput: string;
  sampleOutput: string;
  testCases: ITestCase[];
  timeLimit: number; // in milliseconds
  memoryLimit: number; // in KB
  createdAt: Date;
}

const ProblemSchema = new Schema<IProblem>({
  eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: Number, required: true, min: 1, max: 5 },
  sampleInput: { type: String, required: true },
  sampleOutput: { type: String, required: true },
  testCases: [
    {
      input: { type: String, required: true },
      output: { type: String, required: true },
    },
  ],
  timeLimit: { type: Number, default: 2000 },
  memoryLimit: { type: Number, default: 256000 },
  createdAt: { type: Date, default: Date.now },
});

export const Problem = mongoose.model<IProblem>('Problem', ProblemSchema);
export default Problem;
