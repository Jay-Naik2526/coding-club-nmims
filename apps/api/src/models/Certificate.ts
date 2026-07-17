import mongoose, { Schema, Document } from 'mongoose';

export interface ICertificate extends Document {
  userId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  fileUrl: string;
  issuedAt: Date;
}

const CertificateSchema = new Schema<ICertificate>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  fileUrl: { type: String, required: true },
  issuedAt: { type: Date, default: Date.now },
});

export const Certificate = mongoose.model<ICertificate>('Certificate', CertificateSchema);
export default Certificate;
