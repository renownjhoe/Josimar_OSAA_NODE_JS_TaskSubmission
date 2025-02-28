import logger from '../utils/logger.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errorHandler.js';

export const requireRole = (requiredRole) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      logger.info(`Role check for ${req.user.username}: ${req.user.role} vs required ${requiredRole}`);
      
      if (req.user.role !== requiredRole) {
        throw new ForbiddenError('Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};