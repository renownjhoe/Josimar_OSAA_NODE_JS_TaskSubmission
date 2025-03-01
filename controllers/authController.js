import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { OTP } from '../models/OTP.js';
import logger from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';
import { toObjectId } from '../utils/mongooseUtils.js';
import { 
  ValidationError, 
  UnauthorizedError, 
  ForbiddenError,
  ConflictError, 
  NotFoundError,
  InternalServerError 
} from '../utils/errorHandler.js';
import { sendOTP, verifyOTP as verifyOTPService } from '../services/otpService.js';

export const registerUser = async (req, res, next) => {
  try {
    const { username, passcode, role = 'user', phone, dateOfBirth, referralCode } = req.body;

    // Duplicate check
    const existingUser = await User.findOne({ $or: [{ username }, { phone }] });
    if (existingUser) {
      throw new ConflictError('Username or phone already exists');
    }

    // Validate role
    if (role && !['user', 'admin'].includes(role)) {
      throw new ValidationError('Invalid role. Allowed values: user, admin');
    }

    // Hash passcode
    const hashedPasscode = await bcrypt.hash(passcode, 12);
    
    // Create user  
    const user = await User.create({
      username,
      passcode: hashedPasscode,
      phone,
      dateOfBirth,
      referralCode,
      uuid: uuidv4(),
      role
    });

    // Send OTP via selected channel
    await sendOTP(user, 'whatsapp'); // or 'telegram | whatsapp'

    res.status(201).json({ 
      success: true,
      message: 'OTP sent to your phone',
      userId: user._id
    });

  } catch (error) {
    next(error); // Pass to centralized error handler
  }
};

export const loginUser = async (req, res) => {
  try {
    const { username, passcode } = req.body;

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Verify passcode
    const isValidPasscode = bcrypt.compare(passcode, user.passcode);
    if (!isValidPasscode) {
      throw new UnauthorizedError('Invalid credentials');
    }

    await sendOTP(user, 'whatsapp'); // or 'telegram'

    res.json({
      message: 'OTP sent for verification',
      userId: user._id,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });

  } catch (error) {
    next(error); // Pass to errorHandler
  }
};

export const verifyOTP = async (req, res, next) => {
  try {
    const { userId, code } = req.body;

    // Convert and validate user ID
    const userObjectId = toObjectId(userId);

    // Find valid OTP
    const otpRecord = await OTP.findOne({
      userId: userObjectId,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      throw new NotFoundError('OTP expired or not found');
    }

    const isValid = bcrypt.compare(code, otpRecord.code);
    if (!isValid) {
      await OTP.deleteMany({ userId: userObjectId });
      throw new UnauthorizedError('Invalid OTP code');
    }

    // Cleanup OTP records
    await OTP.deleteMany({ userId: userObjectId });

    // Generate JWT
    const user = await User.findById(userObjectId);
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        uuid: user.uuid
      },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    logger.info(`Successful OTP verification for ${user.username}`);
    
    res.json({
      success: true,
      token,
      userId: user._id,
      username: user.username,
      role: user.role,
      expiresIn: 900
    });

  } catch (error) {
    // Handle specific error types
    if (error.name === 'ValidationError') {
      error.message = 'Invalid user ID format'; // Customize message
    }
    
    // For custom errors, just pass through
    if (!error.statusCode) {
      error = new InternalServerError('OTP verification failed');
    }
    
    next(error);
  }
};