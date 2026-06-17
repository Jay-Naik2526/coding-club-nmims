import mongoose, { Schema, Document } from 'mongoose';

export interface IBadge extends Document {
  name: string;
  iconUrl: string;
  criteria: Record<string, any>;
  createdAt: Date;
}

const BadgeSchema = new Schema<IBadge>({
  name: { type: String, required: true },
  iconUrl: { type: String, required: true },
  criteria: { type: Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Badge = mongoose.model<IBadge>('Badge', BadgeSchema);

export interface IUserBadge extends Document {
  userId: mongoose.Types.ObjectId;
  badgeId: mongoose.Types.ObjectId;
  earnedAt: Date;
}

const UserBadgeSchema = new Schema<IUserBadge>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  badgeId: { type: Schema.Types.ObjectId, ref: 'Badge', required: true },
  earnedAt: { type: Date, default: Date.now },
});

export const UserBadge = mongoose.model<IUserBadge>('UserBadge', UserBadgeSchema);
