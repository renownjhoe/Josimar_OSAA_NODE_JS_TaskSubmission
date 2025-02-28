import { User } from '../models/User.js';
import { ForbiddenError } from '../utils/errorHandler.js';

export const getAllUsers = async (req, res, next) => {
  try {
    // Ensure only admins can access
    if (req.user.role !== 'admin') {
      throw new ForbiddenError('Admin access required');
    }

    // Fetch all users (excluding sensitive fields)
    const users = await User.find({}, { 
      passcode: 0, 
      refreshToken: 0, 
      __v: 0 
    });

    res.json({
      success: true,
      count: users.length,
      users
    });

  } catch (error) {
    next(error);
  }
};