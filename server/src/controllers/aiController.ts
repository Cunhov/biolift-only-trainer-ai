import { Request, Response } from 'express';
import { WorkoutOrchestrator, AgentLog } from '../services/geminiService';

// Since the orchestration takes time and sends multiple updates, 
// we should ideally use Server-Sent Events (SSE) or WebSockets.
// For simplicity in this iteration, we will use SSE.

export const generateWorkout = async (req: Request, res: Response) => {
    const userInput = req.body;

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const logger = (log: AgentLog) => {
        res.write(`data: ${JSON.stringify({ type: 'log', data: log })}\n\n`);
    };

    try {
        const orchestrator = new WorkoutOrchestrator(logger);
        const markdown = await orchestrator.runOrchestration(userInput);

        res.write(`data: ${JSON.stringify({ type: 'result', data: markdown })}\n\n`);
        res.write('event: close\ndata: {}\n\n');
        res.end();
    } catch (error: any) {
        console.error('Generation error:', error);
        res.write(`data: ${JSON.stringify({ type: 'error', message: error.message || 'Unknown error' })}\n\n`);
        res.end();
    }
};

export const refineWorkout = async (req: Request, res: Response) => {
    const { currentContent, request } = req.body;

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const logger = (log: AgentLog) => {
        res.write(`data: ${JSON.stringify({ type: 'log', data: log })}\n\n`);
    };

    try {
        const orchestrator = new WorkoutOrchestrator(logger);
        const markdown = await orchestrator.refineWorkout(currentContent, request);

        res.write(`data: ${JSON.stringify({ type: 'result', data: markdown })}\n\n`);
        res.write('event: close\ndata: {}\n\n');
        res.end();
    } catch (error: any) {
        console.error('Refine error:', error);
        res.write(`data: ${JSON.stringify({ type: 'error', message: error.message || 'Unknown error' })}\n\n`);
        res.end();
    }
};

export const supportChat = async (req: Request, res: Response) => {
    const { message, workoutContext, image } = req.body;

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        const orchestrator = new WorkoutOrchestrator();
        const response = await orchestrator.chatSupport(message, workoutContext, image);

        // Stream the response word by word for better UX
        const words = response.split(' ');
        for (let i = 0; i < words.length; i++) {
            const word = words[i] + (i < words.length - 1 ? ' ' : '');
            res.write(`data: ${JSON.stringify({ type: 'content', content: word })}\n\n`);
            // Small delay for streaming effect
            await new Promise(resolve => setTimeout(resolve, 30));
        }

        res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
        res.end();
    } catch (error: any) {
        console.error('Support chat error:', error);
        res.write(`data: ${JSON.stringify({ type: 'error', message: error.message || 'Unknown error' })}\n\n`);
        res.end();
    }
};
