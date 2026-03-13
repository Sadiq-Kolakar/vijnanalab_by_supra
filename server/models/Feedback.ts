import mongoose, { Schema, Document } from 'mongoose';

export interface IFeedback extends Document {
  userId?: mongoose.Types.ObjectId;
  firebaseUID?: string;
  name: string;
  email: string;
  message: string;
  type: 'feedback' | 'bug' | 'suggestion' | 'contact';
  isRead: boolean;
  createdAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>({
  userId:      { type: Schema.Types.ObjectId, ref: 'User' },
  firebaseUID: { type: String },
  name:        { type: String, required: true },
  email:       { type: String, required: true },
  message:     { type: String, required: true },
  type:        { type: String, enum: ['feedback', 'bug', 'suggestion', 'contact'], default: 'feedback' },
  isRead:      { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<IFeedback>('Feedback', FeedbackSchema);
