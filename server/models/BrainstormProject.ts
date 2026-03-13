import mongoose, { Schema, Document } from 'mongoose';

export interface IBrainstormProject extends Document {
  userId: mongoose.Types.ObjectId;
  firebaseUID: string;
  title: string;
  subject: string;
  topic: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  goal: string;
  hypothesis: string;
  blueprint: {
    aim: string;
    apparatus: string[];
    procedure: string[];
    safety: string;
  };
  status: 'draft' | 'generated' | 'archived';
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BrainstormProjectSchema = new Schema<IBrainstormProject>({
  userId:      { type: Schema.Types.ObjectId, ref: 'User', required: true },
  firebaseUID: { type: String, required: true, index: true },
  title:       { type: String, required: true },
  subject:     { type: String, required: true },
  topic:       { type: String, required: true },
  level:       { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
  goal:        { type: String },
  hypothesis:  { type: String },
  blueprint: {
    aim:       { type: String },
    apparatus: [{ type: String }],
    procedure: [{ type: String }],
    safety:    { type: String }
  },
  status:     { type: String, enum: ['draft', 'generated', 'archived'], default: 'draft' },
  isFavorite: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<IBrainstormProject>('BrainstormProject', BrainstormProjectSchema);
