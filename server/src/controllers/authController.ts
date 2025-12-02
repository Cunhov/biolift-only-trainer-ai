import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../app';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

import axios from 'axios';

export const register = async (req: Request, res: Response) => {
    // Registration is now handled implicitly via login or external system
    res.status(400).json({ error: 'Registration is disabled. Use Login with Email and CPF.' });
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body; // password field will contain CPF

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and CPF are required' });
        }

        // Call external webhook (configurable via environment variable)
        const webhookUrl = process.env.LOGIN_WEBHOOK_URL || 'https://aplicativos-n8n.m23la1.easypanel.host/webhook/login-app-ai-biolift-trainer';

        try {
            const webhookResponse = await axios.post(webhookUrl, {
                email: email.trim(),
                cpf: password.replace(/\D/g, '') // Send only numbers
            });

            // Check for success
            // Webhook returns: [{ "success": "success" }] or [{ "fail": "fail" }]
            const data = webhookResponse.data;

            if (Array.isArray(data) && data.length > 0) {
                const firstItem = data[0];
                if (firstItem.success === 'success') {
                    // Success - continue to create/update user
                } else if (firstItem.fail === 'fail') {
                    return res.status(401).json({ error: 'Invalid credentials' });
                } else {
                    return res.status(401).json({ error: 'Unexpected webhook response' });
                }
            } else {
                return res.status(401).json({ error: 'Invalid webhook response format' });
            }

        } catch (webhookError) {
            console.error('Webhook error:', webhookError);
            return res.status(401).json({ error: 'Authentication failed (Webhook Error)' });
        }

        // Auth successful, find or create user locally
        // Check by email first, then by CPF
        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email },
                    { cpf: password }
                ]
            }
        });

        if (!user) {
            // Create new user
            const hashedPassword = await bcrypt.hash(password, 10);
            user = await prisma.user.create({
                data: {
                    email,
                    cpf: password,
                    password: hashedPassword,
                    name: 'Member',
                },
            });
        } else {
            // Update existing user with latest email and CPF
            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    email: email,
                    cpf: password
                }
            });
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

        res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const me = async (req: any, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { id: true, email: true, name: true, createdAt: true },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
