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

const app = express();
const httpServer = createServer(app);

const io = new Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, { user: JwtPayload }>(
  httpServer,
  {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    },
  }
);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Health check
app.get('/health', (_, res) => {
  res.json({ status: 'ok', game: 'MeowTetr' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Socket.IO
initSocket(io);

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`🐱 MeowTetr backend running on port ${PORT}`);
});