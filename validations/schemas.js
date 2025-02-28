import Joi from 'joi';

export const otpSchema = Joi.object({
  userId: Joi.string().hex().length(24).required(),
  code: Joi.string().pattern(/^\d{6}$/).required()
});

export const registrationSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  passcode: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).required(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
  role: Joi.string().valid('user', 'admin').required()  // Allow role with only these values
});

export const loginSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  passcode: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).required(),
});

export const telegramRegistrationSchema = Joi.object({
  phone: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/) // E.164 format
    .required(),
  username: Joi.string()
    .min(3)
    .max(30)
    .required(),
  telegramUsername: Joi.string()
    .pattern(/^@?[a-zA-Z0-9_]{5,32}$/)
    .required()
});

export const telegramVerificationSchema = Joi.object({
  phone: Joi.string().required(),
  code: Joi.string()
    .pattern(/^\d{6}$/)
    .required(),
  username: Joi.string().required(),
  telegramUsername: Joi.string().required()
});