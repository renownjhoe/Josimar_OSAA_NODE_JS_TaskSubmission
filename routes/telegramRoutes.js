import { Router } from 'express';
import { 
  startTelegramRegistration,
  verifyTelegramOTP
} from '../controllers/telegramController.js';
import { 
  telegramRegistrationSchema,
  telegramVerificationSchema
} from '../validations/schemas.js';
import { validateRequest } from '../validations/validation.js';

const router = Router();

// Corrected routes with proper middleware
router.post(
  '/register',
  validateRequest(telegramRegistrationSchema),
  startTelegramRegistration
);

router.post(
  '/verify',
  validateRequest(telegramVerificationSchema),
  verifyTelegramOTP
);

export default router;