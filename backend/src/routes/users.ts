import { Router } from 'express';
import { getLeaderboard, getProfile, updateSettings } from '../controllers/userController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/leaderboard', getLeaderboard);
router.get('/profile/:username', getProfile);
router.patch('/settings', requireAuth, updateSettings);

export default router;
