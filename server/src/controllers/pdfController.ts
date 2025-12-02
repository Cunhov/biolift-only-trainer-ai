import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { generateWorkoutPDF } from '../services/pdfGenerator';

const prisma = new PrismaClient();

export const exportWorkoutPDF = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).userId;

        // Get workout
        const workout = await prisma.workout.findFirst({
            where: {
                id,
                userId,
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!workout) {
            return res.status(404).json({ error: 'Workout not found' });
        }

        // Generate PDF
        const pdfBuffer = await generateWorkoutPDF(workout, workout.user.name || workout.user.email);

        // Set headers for download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${workout.title.replace(/[^a-z0-9]/gi, '_')}.pdf"`);
        res.setHeader('Content-Length', pdfBuffer.length);

        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
};
