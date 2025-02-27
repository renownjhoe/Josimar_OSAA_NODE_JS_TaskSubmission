import mongoose from 'mongoose';

export const toObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid MongoDB ObjectId format');
  }
  return new mongoose.Types.ObjectId(id);
};

export const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};