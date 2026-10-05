import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

import connectDB from './config/database.js';
import errorHandler from './middleware/errorHandler.js';

// Routes
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profiles.js';
import projectRoutes from './routes/projects.js';
import offerRoutes from './routes/offers.js';
import contractRoutes from './routes/contracts.js';
import messageRoutes from './routes/messages.js';
import notificationRoutes from './routes/notifications.js';
import reviewRoutes from './routes/reviews.js';
import adminRoutes from './routes/admin.js';
import reportRoutes from './routes/reports.js';
import inquiryRoutes from './routes/inquiries.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

// ─── Security ────────────────────────────────────────────────────────────────

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting — only active in production.
// In development all limits are skipped so local testing is never blocked.
if (isProd) {
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests. Please try again later.' },
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' },
  });

  app.use(globalLimiter);
  app.use('/api/v1/auth', authLimiter);
}

// ─── General Middleware ───────────────────────────────────────────────────────

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(isProd ? morgan('combined') : morgan('dev'));

// ─── Static Files ────────────────────────────────────────────────────────────

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ─── Routes ──────────────────────────────────────────────────────────────────

app.use('/api/v1/auth',          authRoutes);
app.use('/api/v1/profile',       profileRoutes);
app.use('/api/v1/projects',      projectRoutes);
app.use('/api/v1/offers',        offerRoutes);
app.use('/api/v1/contracts',     contractRoutes);
app.use('/api/v1/messages',      messageRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/reviews',       reviewRoutes);
app.use('/api/v1/admin',         adminRoutes);
app.use('/api/v1/reports',    reportRoutes);
app.use('/api/v1/inquiries', inquiryRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'CRAFT API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// 404
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler — must be last
app.use(errorHandler);

// ─── Start ───────────────────────────────────────────────────────────────────

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`\n🚀 CRAFT API running on http://localhost:${PORT}`);
    console.log(`📌 Environment: ${process.env.NODE_ENV}`);
    console.log(`📋 API Base:    http://localhost:${PORT}/api/v1\n`);
  });
};

start();

export default app;
