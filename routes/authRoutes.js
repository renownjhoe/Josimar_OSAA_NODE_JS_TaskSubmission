import { Router } from 'express';
import { 
  registerUser,
  loginUser,
  verifyOTP 
} from '../controllers/authController.js';  // Use curly braces for named exports
import { 
  validateRegistration,
  validateLogin,
  validateOTPInput
} from '../validations/authValidations.js';

const router = Router();

router.post('/register', validateRegistration, registerUser);
router.post('/login', validateLogin, loginUser); 
router.post('/verify-otp', validateOTPInput, verifyOTP);

export default router;