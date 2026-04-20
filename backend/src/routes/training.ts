import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/progress', requireAuth, async (req, res) => {
  try {
    const userId = (req as { user?: { userId?: string } }).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const progress = await prisma.lessonProgress.findMany({
      where: { userId },
      select: { lessonId: true, completed: true, attempts: true, completedAt: true },
    });
    res.json(progress);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/progress', requireAuth, async (req, res) => {
  try {
    const userId = (req as { user?: { userId?: string } }).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { lessonId, completed, attempts } = req.body as {
      lessonId?: string;
      completed?: boolean;
      attempts?: number;
    };
    if (!lessonId) {
      res.status(400).json({ error: 'lessonId required' });
      return;
    }

    const progress = await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      create: {
        userId,
        lessonId,
        completed: completed ?? false,
        attempts: attempts ?? 1,
        completedAt: completed ? new Date() : null,
      },
      update: {
        completed: completed ?? false,
        attempts: { increment: 1 },
        completedAt: completed ? new Date() : undefined,
      },
    });

    res.json(progress);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
