import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Iniciar um novo log de treino
export const startWorkoutLog = async (req: Request, res: Response) => {
    try {
        const { workoutId } = req.params;
        const userId = (req as any).userId;

        const workoutLog = await prisma.workoutLog.create({
            data: {
                userId,
                workoutId,
                startedAt: new Date(),
            },
        });

        res.json({ logId: workoutLog.id });
    } catch (error) {
        console.error('Error starting workout log:', error);
        res.status(500).json({ error: 'Failed to start workout log' });
    }
};

// Registrar uma série
export const logSet = async (req: Request, res: Response) => {
    try {
        const { logId, exerciseName } = req.params;
        const { setNumber, reps, weight, rpe } = req.body;

        // Find or create exercise log
        let exerciseLog = await prisma.exerciseLog.findFirst({
            where: {
                workoutLogId: logId,
                exerciseName,
            },
        });

        if (!exerciseLog) {
            exerciseLog = await prisma.exerciseLog.create({
                data: {
                    workoutLogId: logId,
                    exerciseName,
                },
            });
        }

        // Create set log
        const setLog = await prisma.setLog.create({
            data: {
                exerciseLogId: exerciseLog.id,
                setNumber,
                reps,
                weight,
                rpe,
            },
        });

        res.json(setLog);
    } catch (error) {
        console.error('Error logging set:', error);
        res.status(500).json({ error: 'Failed to log set' });
    }
};

// Marcar exercício como pulado
export const skipExercise = async (req: Request, res: Response) => {
    try {
        const { logId, exerciseName } = req.params;
        const { notes } = req.body;

        const exerciseLog = await prisma.exerciseLog.create({
            data: {
                workoutLogId: logId,
                exerciseName,
                skipped: true,
                notes,
            },
        });

        res.json(exerciseLog);
    } catch (error) {
        console.error('Error skipping exercise:', error);
        res.status(500).json({ error: 'Failed to skip exercise' });
    }
};

// Finalizar treino e gerar análise
export const completeWorkoutLog = async (req: Request, res: Response) => {
    try {
        const { logId } = req.params;

        const workoutLog = await prisma.workoutLog.findUnique({
            where: { id: logId },
            include: {
                exercises: {
                    include: {
                        sets: true,
                    },
                },
                workout: true,
            },
        });

        if (!workoutLog) {
            return res.status(404).json({ error: 'Workout log not found' });
        }

        // Calculate duration
        const duration = Math.floor(
            (new Date().getTime() - new Date(workoutLog.startedAt).getTime()) / 1000
        );

        // Update log
        await prisma.workoutLog.update({
            where: { id: logId },
            data: {
                completedAt: new Date(),
                duration,
            },
        });

        // Generate analysis (simple version for now)
        const analysis = generateProgressionAnalysis(workoutLog);

        res.json({
            summary: {
                duration,
                exercisesCompleted: workoutLog.exercises.filter(e => !e.skipped).length,
                totalSets: workoutLog.exercises.reduce((sum, e) => sum + e.sets.length, 0),
            },
            suggestions: analysis,
        });
    } catch (error) {
        console.error('Error completing workout log:', error);
        res.status(500).json({ error: 'Failed to complete workout log' });
    }
};

// Get workout logs history
export const getWorkoutLogs = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { workoutId } = req.query;

        const where: any = { userId };
        if (workoutId) {
            where.workoutId = workoutId;
        }

        const logs = await prisma.workoutLog.findMany({
            where,
            include: {
                workout: {
                    select: {
                        title: true,
                    },
                },
                exercises: {
                    include: {
                        sets: true,
                    },
                },
            },
            orderBy: {
                startedAt: 'desc',
            },
            take: 10,
        });

        res.json(logs);
    } catch (error) {
        console.error('Error fetching workout logs:', error);
        res.status(500).json({ error: 'Failed to fetch workout logs' });
    }
};

// Simple progression analysis
function generateProgressionAnalysis(workoutLog: any) {
    const suggestions: any[] = [];

    workoutLog.exercises.forEach((exercise: any) => {
        if (exercise.skipped) return;

        const sets = exercise.sets;
        if (sets.length === 0) return;

        const avgReps = sets.reduce((sum: number, set: any) => sum + (set.reps || 0), 0) / sets.length;
        const allSetsComplete = sets.every((set: any) => set.reps && set.reps >= 8); // Assuming 8 is minimum

        let suggestion = '';
        let status = 'maintain';

        if (allSetsComplete && avgReps >= 12) {
            suggestion = 'Você está consistente no limite superior! Tente aumentar a dificuldade (progressão).';
            status = 'progress';
        } else if (avgReps < 6) {
            suggestion = 'Ainda desafiador. Considere uma regressão ou assistência.';
            status = 'regress';
        } else {
            suggestion = 'Bom trabalho! Mantenha o mesmo volume e foco na técnica.';
            status = 'maintain';
        }

        suggestions.push({
            exercise: exercise.exerciseName,
            sets: sets.map((s: any) => ({ setNumber: s.setNumber, reps: s.reps })),
            status,
            suggestion,
        });
    });

    return suggestions;
}
