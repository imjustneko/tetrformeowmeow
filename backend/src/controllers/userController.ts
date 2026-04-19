import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

export async function getLeaderboard(req: Request, res: Response): Promise<void> {
  try {
    const users = await prisma.user.findMany({
      orderBy: { rating: 'desc' },
      take: 50,
      select: {
        id: true,
        username: true,
        rating: true,
        stats: {
          select: {
            gamesPlayed: true,
            wins: true,
            avgAPM: true,
            avgPPS: true,
          },
        },
      },
    });

    res.json(users);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getProfile(req: Request, res: Response): Promise<void> {
  try {
    const raw = req.params.username;
    const username = Array.isArray(raw) ? raw[0] : raw;
    if (!username) {
      res.status(400).json({ error: 'Username required' });
      return;
    }
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        rating: true,
        createdAt: true,
        stats: true,
        matchPlayers: {
          orderBy: { match: { startedAt: 'desc' } },
          take: 20,
          include: { match: { select: { mode: true, startedAt: true, endedAt: true } } },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

const settingsSchema = z.object({
  keybinds: z.record(z.string(), z.string()).optional(),
  das: z.number().min(0).max(500).optional(),
  arr: z.number().min(0).max(500).optional(),
  /** 0 = instant / “infinity” soft drop */
  softDropFactor: z.number().min(0).max(60).optional(),
  handlingConfig: z.record(z.string(), z.unknown()).optional(),
  musicVolume: z.number().min(0).max(1).optional(),
  sfxVolume: z.number().min(0).max(1).optional(),
  boardSkin: z.string().optional(),
});

export async function updateSettings(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user.userId;
    const parsed = settingsSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0].message });
      return;
    }

    const settings = await prisma.userSettings.update({
      where: { userId },
      data: parsed.data as Prisma.UserSettingsUpdateInput,
    });

    res.json(settings);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}