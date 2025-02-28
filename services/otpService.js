import bcrypt from 'bcryptjs';
import { OTP } from '../models/OTP.js';
import twilio from 'twilio';
import {
  ValidationError,
  InternalServerError
} from '../utils/errorHandler.js';
import { sendWhatsAppToken } from './whatsapppService.js';
import { sendTelegramOtp } from './telegramService.js';
import { generateOTP } from '../utils/generateOtp.js';

export const sendOTP = async (user, channel) => {
  try {
    if (!['whatsapp', 'telegram'].includes(channel)) {
      return ValidationError('Invalid OTP channel specified');
    }

    const rawOTP = generateOTP();
    const hashedOTP = await bcrypt.hash(rawOTP, 8);

    // Store OTP record
    await OTP.create({
      userId: user._id,
      code: hashedOTP,
      channel,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    });
    logger.info(`OTP created for ${user.phone} is ${rawOTP}`);

    // Send via selected channel whatsapp | telegram
    if (channel === 'whatsapp') {
        await sendWhatsAppToken(user.phone, rawOTP);
    } else if (channel === 'telegram') {
      await sendTelegramOtp(user, rawOTP);
    }
    logger.info(`OTP sent via ${channel} to ${user.phone}`);
    return true;

  } catch (error) {
    logger.error(`OTP send failed: ${error.message}`);
    return InternalServerError('Failed to send OTP');
  }
};

export const verifyOTP = async (userId, code) => {
  try {
    const otpRecord = await OTP.findOne({
      userId,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    if (!otpRecord) throw new ValidationError('No active OTP found');
    
    const isValid = await bcrypt.compare(code, otpRecord.code);
    if (!isValid) throw new ValidationError('Invalid OTP code');

    await OTP.deleteMany({ userId });
    return true;

  } catch (error) {
    logger.error(`OTP verification failed: ${error.message}`);
    throw error;
  }
};