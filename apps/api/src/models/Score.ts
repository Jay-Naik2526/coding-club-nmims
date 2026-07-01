import mongoose, { Schema, Document } from 'mongoose';

/**
 * A single round's point award for one registration (solo entrant or team)
 * in a live-judged, non-coding event — e.g. PromptCraft Arena's 3 rounds.
 * One document per (registrationId, round); admin upserts overwrite the
 * points for that round instead of accumulating duplicate rows.
 */
export interface IScore extends Document {
  eventId: mongoose.Types.ObjectId;
  registrationId: mongoose.Types.ObjectId;
  round: number;
  label: string;
  points: number;
  updatedAt: Date;
}

const ScoreSchema = new Schema<IScore>({
  eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  registrationId: { type: Schema.Types.ObjectId, ref: 'Registration', required: true },
  round: { type: Number, required: true },
  label: { type: String, default: '' },
  points: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
});

ScoreSchema.index({ registrationId: 1, round: 1 }, { unique: true });

export const Score = mongoose.model<IScore>('Score', ScoreSchema);
export default Score;
