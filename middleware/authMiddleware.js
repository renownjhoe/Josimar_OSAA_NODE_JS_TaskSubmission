import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { UnauthorizedError } from '../utils/errorHandler.js';

export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or invalid authentication token');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.userId).select('-passcode -refreshToken');
    if (!user) throw new UnauthorizedError('User not found');

    req.user = user; // Attach user to request object
    next();
  } catch (error) {
    next(error);
  }
};