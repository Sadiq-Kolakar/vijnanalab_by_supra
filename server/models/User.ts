import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  firebaseUID: string;
  name: string;
  email: string;
  role: 'Student' | 'Teacher' | 'Admin';
  grade?: string;
  institution?: string;
  avatar?: string;
  labsCompleted: number;
  totalScore: number;
  streak: number;
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  firebaseUID: { type: String, required: true, unique: true, index: true },
  name:        { type: String, required: true },
  email:       { type: String, required: true, unique: true },
  role:        { type: String, enum: ['Student', 'Teacher', 'Admin'], default: 'Student' },
  grade:       { type: String },
  institution: { type: String },
  avatar:      { type: String },
  labsCompleted: { type: Number, default: 0 },
  totalScore:    { type: Number, default: 0 },
  streak:        { type: Number, default: 0 },
  lastActive:    { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
