import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';

export interface ICategory extends Document {
  name: string;
  user: IUser['_id'];
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
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

export default mongoose.models.Category || mongoose.model<ICategory>('Category', categorySchema);