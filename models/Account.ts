import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';

export interface IAccount extends Document {
  name: string;
  type: 'bank' | 'credit-card';
  balance: number;
  accountNumber?: string;
  creditLimit?: number;
  user: IUser['_id'];
  createdAt: Date;
  updatedAt: Date;
}

const accountSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Account name is required'],
    trim: true,
  },
  type: {
    type: String,
    enum: ['bank', 'credit-card'],
    required: [true, 'Account type is required'],
  },
  balance: {
    type: Number,
    required: [true, 'Balance is required'],
    default: 0,
  },
  accountNumber: {
    type: String,
    trim: true,
  },
  creditLimit: {
    type: Number,
    default: 0,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
  },
}, {
  timestamps: true,
});

export default mongoose.models.Account || mongoose.model<IAccount>('Account', accountSchema);