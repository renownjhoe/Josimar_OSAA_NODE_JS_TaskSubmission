import rateLimit from 'express-rate-limit';

export default rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 attempts
  message: 'Too many login attempts. Try again in an hour.',
  standardHeaders: true,
  legacyHeaders: false
});