// controllers/telegramController.js
import TelegramBot from 'node-telegram-bot-api';
import { User } from '../models/User.js';
import { OTP } from '../models/OTP.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';
import { 
  ValidationError,
  ConflictError,
  NotFoundError 
} from '../utils/errorHandler.js';

// Initialize Telegram Bot
const telegramBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
  polling: true,
  filepath: false
});

// In-memory store for Telegram chat IDs (use Redis in production)
const telegramChatIds = new Map();

// Listen for Telegram messages to capture chat IDs
telegramBot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username;
  
  if (username) {
    telegramChatIds.set(username, chatId);
    logger.info(`Registered Telegram chat ID for @${username}`);
  }
});

// Helper function to send OTP via Telegram
const sendTelegramOTP = async (username, otp) => {
  const chatId = telegramChatIds.get(username);
  
  if (!chatId) {
    throw new NotFoundError('Telegram username not found. Start chat with bot first.');
  }

  await telegramBot.sendMessage(
    chatId,
    `🔐 Your verification code: ${otp}\n This code expires in 5 minutes.`
  );
};

// Generate numeric OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Start Telegram registration flow
export const startTelegramRegistration = async (req, res, next) => {
  try {
    const { phone, username, telegramUsername, role = "user", passcode } = req.body;

    // Validate input
    if (!phone || !username || !telegramUsername) {
      throw new ValidationError('Missing required fields: phone, username, telegramUsername');
    }

    // Check existing users
    const existingUser = await User.findOne({ 
      $or: [{ phone }, { username }, { telegramUsername }] 
    });
    
    if (existingUser) {
      throw new ConflictError('User already exists with these credentials');
    }

    // Generate and store OTP
    const otp = generateOTP();
    const hashedOTP = await bcrypt.hash(otp, 8);
    
    await OTP.create({
      phone,
      code: hashedOTP,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      authMethod: 'telegram'
    });

    // Send OTP via Telegram
    await sendTelegramOTP(telegramUsername, otp);

    res.status(200).json({
      success: true,
      message: 'OTP sent to Telegram',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      nextStep: '/api/auth/verify/telegram'
    });

  } catch (error) {
    next(error);
  }
};

// Complete Telegram registration with OTP verification
export const verifyTelegramOTP = async (req, res, next) => {
  try {
    const { phone, code, username, telegramUsername } = req.body;

    // Validate input
    if (!phone || !code || !username || !telegramUsername) {
      throw new ValidationError('Missing required fields');
    }

    // Get valid OTP record
    const otpRecord = await OTP.findOne({
      phone,
      expiresAt: { $gt: new Date() },
      authMethod: 'telegram'
    }).sort({ createdAt: -1 });

    if (!otpRecord || !bcrypt.compare(code, otpRecord.code)) {
      throw new ValidationError('Invalid or expired OTP');
    }

    // Create new user
    const user = await User.create({
      username,
      phone,
      telegramUsername,
      uuid: uuidv4(),
      authMethod: 'telegram',
      role: 'user',
      verified: true
    });

    // Cleanup OTP records
    await OTP.deleteMany({ phone });

    // Generate JWT token
    const token = user.generateAuthToken();

    res.status(201).json({
      success: true,
      message: 'Telegram registration successful',
      user: {
        id: user._id,
        username: user.username,
        telegramUsername: user.telegramUsername
      },
      token
    });

  } catch (error) {
    next(error);
  }
};