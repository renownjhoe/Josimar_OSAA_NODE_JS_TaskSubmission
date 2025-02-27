import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  passcode: String,
  uuid: { type: String, default: uuidv4 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  phone: String,
  createdAt: { type: Date, default: Date.now }
});

// Named export
export const User = mongoose.model('User', userSchema);