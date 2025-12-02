import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
    createWorkout,
    getWorkouts,
    getWorkout,
    updateWorkout,
    deleteWorkout,
} from '../controllers/workoutController';
import { exportWorkoutPDF } from '../controllers/pdfController';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.post('/', createWorkout);
router.get('/', getWorkouts);
router.get('/:id', getWorkout);
router.put('/:id', updateWorkout);
router.delete('/:id', deleteWorkout);

// PDF Export
router.get('/:id/export-pdf', exportWorkoutPDF);

export default router;
