import { Request, Response } from 'express';
import { prisma } from '../app';

interface AuthRequest extends Request {
    user?: {
        userId: string;
    };
}

export const createWorkout = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { title, content, originalInput } = req.body;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });
        if (!title || !content) return res.status(400).json({ error: 'Title and content are required' });

        const workout = await prisma.workout.create({
            data: {
                userId,
                title,
                content,
                originalInput: JSON.stringify(originalInput),
            },
        });

        res.status(201).json(workout);
    } catch (error) {
        console.error('Create workout error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getWorkouts = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const workouts = await prisma.workout.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        res.json(workouts);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getWorkout = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const workout = await prisma.workout.findFirst({
            where: { id, userId },
        });

        if (!workout) return res.status(404).json({ error: 'Workout not found' });

        res.json(workout);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteWorkout = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const workout = await prisma.workout.findFirst({
            where: { id, userId },
        });

        if (!workout) return res.status(404).json({ error: 'Workout not found' });

        await prisma.workout.delete({ where: { id } });

        res.json({ message: 'Workout deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateWorkout = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;
        const { content, title } = req.body;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const workout = await prisma.workout.findFirst({
            where: { id, userId },
        });

        if (!workout) return res.status(404).json({ error: 'Workout not found' });

        const updatedWorkout = await prisma.workout.update({
            where: { id },
            data: {
                content: content || workout.content,
                title: title || workout.title
            }
        });

        res.json(updatedWorkout);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
