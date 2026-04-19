import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, logout, getMe } from '../controllers/authController';
import { requireAuth } from '../middleware/auth';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts, try again in 15 minutes' },
  skip: (req) => req.method === 'OPTIONS',
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Too many accounts created from this IP' },
  skip: (req) => req.method === 'OPTIONS',
});

router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);

export default router;