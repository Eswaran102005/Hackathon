import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import apiRouter from './routes/apiRoutes';
import { errorHandler } from './middleware/errorHandler';
import { SeedService } from './services/seedService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const prisma = new PrismaClient();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api', apiRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'RecoverAI Backend API', timestamp: new Date().toISOString() });
});

// Centralized Error Handler
app.use(errorHandler);

// Database initialization and server startup
async function startServer() {
  try {
    console.log('🔄 Connecting to database...');
    await prisma.$connect();
    console.log('✅ Database connected.');

    // Check if merchant exists, if not seed database automatically
    const merchantCount = await prisma.merchant.count();
    if (merchantCount === 0) {
      console.log('⚡ Empty database detected. Running automatic initial seeding...');
      await SeedService.seedDatabase(prisma);
    }

    app.listen(PORT, () => {
      console.log(`\n🚀 RecoverAI Backend Server running on http://localhost:${PORT}`);
      console.log(`📊 Health Check: http://localhost:${PORT}/health`);
      console.log(`🤖 AI Engine scoring and strategy active.`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
