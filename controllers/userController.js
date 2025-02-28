import { User } from '../models/User.js';
import { NotFoundError } from '../utils/errorHandler.js';
import logger from '../utils/logger.js';

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id, {
      passcode: 0,
      refreshToken: 0,
      __v: 0
    });
    if (!user) {
      throw new NotFoundError('User not found');
    }
    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};
