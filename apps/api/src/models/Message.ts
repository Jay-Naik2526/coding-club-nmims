import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  fullName: string;
  sapId: string;
  campusDept: string;
  email: string;
  message: string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  fullName: { type: String, required: true },
  sapId: { type: String, required: true },
  campusDept: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
export default Message;
