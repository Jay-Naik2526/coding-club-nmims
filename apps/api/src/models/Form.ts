import mongoose, { Schema, Document } from 'mongoose';

export interface IFormField {
  name: string; // key of the field
  label: string;
  type: 'text' | 'number' | 'email' | 'select' | 'textarea' | 'checkbox';
  required: boolean;
  options?: string[]; // for select
}

export interface IForm extends Document {
  title: string;
  slug: string;
  fields: IFormField[];
  eventId?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  isPublished: boolean;
  createdAt: Date;
}

const FormSchema = new Schema<IForm>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  fields: [
    {
      name: { type: String, required: true },
      label: { type: String, required: true },
      type: { type: String, enum: ['text', 'number', 'email', 'select', 'textarea', 'checkbox'], required: true },
      required: { type: Boolean, default: true },
      options: [{ type: String }],
    },
  ],
  eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isPublished: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const Form = mongoose.model<IForm>('Form', FormSchema);

export interface IFormResponse extends Document {
  formId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  responseData: Record<string, any>;
  submittedAt: Date;
}

const FormResponseSchema = new Schema<IFormResponse>({
  formId: { type: Schema.Types.ObjectId, ref: 'Form', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  responseData: { type: Schema.Types.Mixed, required: true },
  submittedAt: { type: Date, default: Date.now },
});

export const FormResponse = mongoose.model<IFormResponse>('FormResponse', FormResponseSchema);
