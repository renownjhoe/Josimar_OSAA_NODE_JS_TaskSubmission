import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  code: String,
  expiresAt: Date,
  createdAt: { type: Date, default: Date.now }
});

// Named export
export const OTP = mongoose.model('OTP', otpSchema);