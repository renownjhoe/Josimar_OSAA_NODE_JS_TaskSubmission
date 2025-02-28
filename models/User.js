import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  passcode: String,
  uuid: { type: String, default: uuidv4 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  phone: String,
  createdAt: { type: Date, default: Date.now },
  telegramUsername: {
    type: String,
    unique: true,
    match: /^@?[a-zA-Z0-9_]{5,32}$/
  }
});

userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    {
      userId: this._id,
      role: this.role,
      uuid: this.uuid
    },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

// Named export
export const User = mongoose.model('User', userSchema);
