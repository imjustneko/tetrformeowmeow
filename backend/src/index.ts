import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { DefaultEventsMap, Server } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import { initSocket } from './socket';
import type { JwtPayload } from './types';
import { prisma } from './lib/prisma';

/** Browsers send Origin without a trailing slash; env vars often include one. */
function normalizeFrontendOrigin(url: string): string {
  return url.trim().replace(/\/+$/, '') || 'http://localhost:3000';
}

/** Comma-separated FRONTEND_URL values (production + preview domains, etc.). */
function parseFrontendOrigins(): string[] {
  const raw = process.env.FRONTEND_URL || 'http://localhost:3000';
  const list = raw
    .split(',')
    .map((s) => normalizeFrontendOrigin(s))
    .filter(Boolean);
  return list.length ? list : ['http://localhost:3000'];
}

const frontendOrigins = parseFrontendOrigins();

/**
 * Infer Vercel project slug from FRONTEND_URL (e.g. https://meowtetr.vercel.app → meowtetr).
 * Override with VERCEL_PROJECT_SLUG when needed.
 */
function normalizeSlug(raw: string): string {
  return raw.trim().replace(/^["']|["']$/g, '').toLowerCase();
}

function inferVercelProjectSlug(): string | null {
  const explicit = process.env.VERCEL_PROJECT_SLUG?.trim();
  if (explicit) {
    const s = normalizeSlug(explicit);
    return s || null;
  }
  for (const url of frontendOrigins) {
    try {
      const host = new URL(url).hostname.toLowerCase();
      if (!host.endsWith('.vercel.app')) continue;
      const base = host.slice(0, -'.vercel.app'.length);
      if (!base) continue;
      if (base.includes('-git-')) {
        const s = normalizeSlug(base.split('-git-')[0] || '');
        return s || null;
      }
      if (!base.includes('-')) return base.toLowerCase();
      const s = normalizeSlug(base.split('-')[0] || '');
      return s || null;
    } catch {
      /* skip */
    }
  }
  return null;
}

const vercelProjectSlug = inferVercelProjectSlug();
/** When FRONTEND_URL points at *.vercel.app, preview URLs like meowtetr-xxx-team.vercel.app are allowed unless VERCEL_PREVIEW_CORS=0. */
const allowVercelPreviewOrigins =
  vercelProjectSlug !== null && process.env.VERCEL_PREVIEW_CORS !== '0';

function hostMatchesVercelProject(host: string, slug: string): boolean {
  const h = host.toLowerCase();
  const s = slug.toLowerCase();
  return h === `${s}.vercel.app` || (h.startsWith(`${s}-`) && h.endsWith('.vercel.app'));
}

function isAllowedCorsOrigin(origin: string | undefined): boolean {
  if (!origin) return true;
  const normalized = normalizeFrontendOrigin(origin);
  if (frontendOrigins.includes(normalized)) return true;
  if (!allowVercelPreviewOrigins || !vercelProjectSlug) return false;
  try {
    const host = new URL(normalized).hostname;
    return hostMatchesVercelProject(host, vercelProjectSlug);
  } catch {
    return false;
  }
}

const corsOptions: cors.CorsOptions = {
  origin: (origin, cb) => {
    if (isAllowedCorsOrigin(origin)) {
      cb(null, true);
    } else {
      console.warn(
        `[CORS] Blocked HTTP origin: ${origin ?? '(none)'} (allowlist: ${frontendOrigins.join(' | ')}${allowVercelPreviewOrigins ? ` + Vercel "${vercelProjectSlug}"` : ''})`
      );
      cb(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 204,
};

const app = express();
const httpServer = createServer(app);

const io = new Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, { user: JwtPayload }>(
  httpServer,
  {
    cors: {
      origin: (origin, cb) => {
        if (isAllowedCorsOrigin(origin)) {
          cb(null, true);
        } else {
          console.warn(`[CORS] Blocked Socket.IO origin: ${origin ?? '(none)'}`);
          cb(null, false);
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'OPTIONS'],
    },
  }
);

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Health check
app.get('/health', (_, res) => {
  res.json({ status: 'ok', game: 'MeowTetr' });
});

/** Confirms Prisma can query Supabase (or any Postgres) at runtime — not only at build. */
app.get('/health/db', async (_, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    console.error('[health/db]', err);
    res.status(503).json({ status: 'error', database: 'unreachable' });
  }
});

/** What the running server uses for CORS (no secrets). Open this on Render if register/login still show CORS in DevTools. */
app.get('/health/cors', (_, res) => {
  res.json({
    exactOrigins: frontendOrigins,
    vercelProjectSlug,
    allowVercelPreviewOrigins,
    vercelPreviewCorsEnv: process.env.VERCEL_PREVIEW_CORS ?? '(unset)',
    nodeEnv: process.env.NODE_ENV ?? '(unset)',
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Socket.IO
initSocket(io);

const PORT = process.env.PORT || 4000;

function logCorsBootstrap(): void {
  console.log(`[CORS] Exact allowlist: ${frontendOrigins.join(', ')}`);
  if (vercelProjectSlug && allowVercelPreviewOrigins) {
    console.log(
      `[CORS] Vercel hosts allowed for slug "${vercelProjectSlug}": ${vercelProjectSlug}.vercel.app and ${vercelProjectSlug}-*.vercel.app`
    );
  } else if (process.env.NODE_ENV === 'production') {
    console.warn(
      '[CORS] No Vercel slug (set FRONTEND_URL to https://<project>.vercel.app and/or VERCEL_PROJECT_SLUG=<project>). Preview deploy URLs will be blocked.'
    );
  }
  const isLocalhostOrigin = (o: string): boolean => {
    try {
      return /localhost|127\.0\.0\.1/.test(new URL(o).hostname);
    } catch {
      return false;
    }
  };
  if (
    process.env.NODE_ENV === 'production' &&
    frontendOrigins.every(isLocalhostOrigin) &&
    !allowVercelPreviewOrigins
  ) {
    console.warn(
      '[CORS] FRONTEND_URL is localhost-only and Vercel previews are off — browsers on Vercel cannot call this API until you set FRONTEND_URL or VERCEL_PROJECT_SLUG on Render.'
    );
  }
}

httpServer.listen(PORT, () => {
  console.log(`🐱 MeowTetr backend running on port ${PORT}`);
  logCorsBootstrap();
});