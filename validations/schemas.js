import Joi from 'joi';

export const otpSchema = Joi.object({
  userId: Joi.string().hex().length(24).required(),
  code: Joi.string().pattern(/^\d{6}$/).required()
});

export const registrationSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  passcode: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).required(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required()
});

export const loginSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  passcode: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).required(),
});