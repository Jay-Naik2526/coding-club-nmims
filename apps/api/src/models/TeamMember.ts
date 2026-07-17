import mongoose, { Schema, Document } from 'mongoose';

export interface ITeamMember extends Document {
  registrationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  isLeader: boolean;
  createdAt: Date;
}

const TeamMemberSchema = new Schema<ITeamMember>({
  registrationId: { type: Schema.Types.ObjectId, ref: 'Registration', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isLeader: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const TeamMember = mongoose.model<ITeamMember>('TeamMember', TeamMemberSchema);
export default TeamMember;
