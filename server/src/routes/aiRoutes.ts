import express from 'express';
import { generateWorkout, refineWorkout, supportChat } from '../controllers/aiController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.post('/generate', generateWorkout);
router.post('/refine', refineWorkout);
router.post('/support', supportChat);

export default router;
