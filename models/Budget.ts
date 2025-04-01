import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';

export interface IBudget extends Document {
  category: string;
  allocated: number;
  spent: number;
  period: string;
  user: IUser['_id'];
  createdAt: Date;
  updatedAt: Date;
}

const budgetSchema = new Schema({
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
  },
  allocated: {
    type: Number,
    required: [true, 'Allocated amount is required'],
    min: 0,
  },
  spent: {
    type: Number,
    default: 0,
    min: 0,
  },
  period: {
    type: String,
    required: [true, 'Period is required'],
    trim: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
  },
}, {
  timestamps: true,
});

export default mongoose.models.Budget || mongoose.model<IBudget>('Budget', budgetSchema);