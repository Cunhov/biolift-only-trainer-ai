import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
    startWorkoutLog,
    logSet,
    skipExercise,
    completeWorkoutLog,
    getWorkoutLogs,
} from '../controllers/workoutLogController';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Start a workout
router.post('/workouts/:workoutId/start', startWorkoutLog);

// Log a set
router.post('/logs/:logId/exercises/:exerciseName/sets', logSet);

// Skip an exercise
router.post('/logs/:logId/exercises/:exerciseName/skip', skipExercise);

// Complete workout
router.post('/logs/:logId/complete', completeWorkoutLog);

// Get workout logs history
router.get('/logs', getWorkoutLogs);

export default router;
