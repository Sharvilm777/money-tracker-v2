import { Document, Model } from 'mongoose';

declare module 'mongoose' {
  interface Model<T extends Document, QueryHelpers = {}> {
    findOne: any;
    find: any;
    findById: any;
    findByIdAndUpdate: any;
    findByIdAndDelete: any;
    findOneAndUpdate: any;
    findOneAndDelete: any;
    updateOne: any;
    deleteOne: any;
    create: any;
    aggregate: any;
    countDocuments: any;
  }
}