import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';
import { IAccount } from './Account';

export interface ITransaction extends Document {
  amount: number;
  type: 'credit' | 'debit';
  category: string;
  subCategory?: string;
  description: string;
  date: string;
  sourceAccount: IAccount['_id'];
  billingCycle: string;
  user: IUser['_id'];
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema({
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
  },
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: [true, 'Transaction type is required'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
  },
  subCategory: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  date: {
    type: String,
    required: [true, 'Date is required'],
  },
  sourceAccount: {
    type: Schema.Types.ObjectId,
    ref: 'Account',
    required: [true, 'Source account is required'],
  },
  billingCycle: {
    type: String,
    required: [true, 'Billing cycle is required'],
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
  },
}, {
  timestamps: true,
});

export default mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', transactionSchema);