import mongoose from 'mongoose';

export const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

export const toObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ValidationError('Invalid user ID format');
  }
  return new mongoose.Types.ObjectId(id);
};