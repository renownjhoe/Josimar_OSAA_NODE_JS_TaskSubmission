import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { OTP } from '../models/OTP.js';
import logger from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';
import { toObjectId } from '../utils/mongooseUtils.js';


// Helper function to generate 6-digit OTP
const generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log('Generated OTP:', otp); // Debug log
  return otp;
};


export const registerUser = async (req, res) => {
  try {
    const { username, passcode, phone, dateOfBirth, referralCode } = req.body;

    // Duplicate check
    const existingUser = await User.findOne({ $or: [{ username }, { phone }] });
    if (existingUser) {
      logger.warn(`Duplicate registration attempt: ${username}`);
      return res.status(409).json({ error: 'Username or phone already exists' });
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
      role: 'user'
    });

    // Generate and store OTP
    const rawOTP = generateOTP();
    const hashedOTP = await bcrypt.hash(rawOTP, 8); // Salt rounds 8-12
    await OTP.create({
      userId: user._id,
      code: hashedOTP, // Hash OTP for storage
      expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    });

    // Simulate OTP delivery
    logger.info(`OTP for ${phone}: ${rawOTP}`);
    logger.info(`User registered: ${user.username} (${user._id})`);

    res.status(201).json({ 
      message: 'OTP sent to your phone',
      userId: user._id
    });

  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { username, passcode } = req.body;

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      logger.warn(`Login attempt for non-existent user: ${username}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify passcode
    const isValidPasscode = bcrypt.compare(passcode, user.passcode);
    if (!isValidPasscode) {
      logger.warn(`Invalid passcode for user: ${username}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate and store OTP
    const rawOTP = generateOTP();
    const hashedOTP = await bcrypt.hash(rawOTP, 8); // Salt rounds 8-12
    await OTP.create({
      userId: user._id,
      code: hashedOTP, // Hash OTP for storage
      expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    });

    // Simulate OTP delivery
    logger.info(`Login OTP for ${user.phone}: ${rawOTP}`);
    logger.info(`MFA triggered for user: ${username}`);

    res.json({
      message: 'OTP sent for verification',
      userId: user._id,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });

  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { userId, code } = req.body;

    // 2. Convert userId to ObjectId
    const userObjectId = toObjectId(userId);

    // 3. Find the latest valid OTP
    const otpRecord = await OTP.findOne({
      userId: userObjectId,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    // 4. Verify OTP exists and matches
    if (!otpRecord) {
      logger.warn(`No valid OTP found for user: ${userId}`);
      return res.status(401).json({ error: 'OTP expired' });
    }

    const isValid = await bcrypt.compare(code, otpRecord.code);
    if (!isValid) {
      logger.warn(`Invalid OTP attempt for user: ${userId}`);
      await OTP.deleteMany({ userId: userObjectId });
      return res.status(401).json({ error: 'Invalid OTP' });
    }

    // 5. Cleanup OTP records
    await OTP.deleteMany({ userId: userObjectId });

    // 6. Generate JWT
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
      token,
      userId: user._id,
      role: user.role,
      expiresIn: 900
    });

  } catch (error) {
    logger.error(`OTP verification failed: ${error.message}`);
    if (error.message.includes('Invalid MongoDB ObjectId')) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    res.status(500).json({ error: 'OTP verification failed' });
  }
};