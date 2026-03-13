import mongoose, { Schema, Document } from 'mongoose';

export interface ILabProgress extends Document {
  userId: mongoose.Types.ObjectId;
  firebaseUID: string;
  subjectId: string;
  labId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  score: number;
  timeSpent: number;       // in seconds
  attempts: number;
  quizAnswers: number[];
  observations: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LabProgressSchema = new Schema<ILabProgress>({
  userId:      { type: Schema.Types.ObjectId, ref: 'User', required: true },
  firebaseUID: { type: String, required: true, index: true },
  subjectId:   { type: String, required: true },
  labId:       { type: String, required: true },
  status:      { type: String, enum: ['not_started', 'in_progress', 'completed'], default: 'not_started' },
  score:       { type: Number, default: 0 },
  timeSpent:   { type: Number, default: 0 },
  attempts:    { type: Number, default: 0 },
  quizAnswers: [{ type: Number }],
  observations:{ type: String, default: '' },
  completedAt: { type: Date },
}, { timestamps: true });

// Compound index: one progress record per user per lab
LabProgressSchema.index({ firebaseUID: 1, subjectId: 1, labId: 1 }, { unique: true });

export default mongoose.model<ILabProgress>('LabProgress', LabProgressSchema);
