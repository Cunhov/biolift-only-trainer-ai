import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for image uploads
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check route
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

import authRoutes from './routes/authRoutes';
import workoutRoutes from './routes/workoutRoutes';
import aiRoutes from './routes/aiRoutes';
import workoutLogRoutes from './routes/workoutLogRoutes';
import { startCronJobs } from './cron/dailyJob';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/workout-logs', workoutLogRoutes);

// Start Cron Jobs
startCronJobs();

export { app, prisma };
