/// <reference types="vite/client" />
export interface PoeMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface PoeOptions {
    model?: string;
    messages: PoeMessage[];
    onContent?: (content: string) => void;
    onError?: (error: string) => void;
    onDone?: (fullContent: string) => void;
}

const POE_API_KEY = import.meta.env.VITE_POE_API_KEY;
const POE_MODEL = import.meta.env.VITE_POE_MODEL || 'gemini-3-flash';
const API_URL = 'https://api.poe.com/v1/chat/completions';

export const poe = {
    chat: async (options: PoeOptions) => {
        if (!POE_API_KEY || POE_API_KEY === 'your_poe_api_key_here') {
            options.onError?.('Poe API Key não configurada no .env');
            return;
        }

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${POE_API_KEY}`
                },
                body: JSON.stringify({
                    model: options.model || POE_MODEL,
                    messages: options.messages,
                    stream: true
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `Erro na API do Poe: ${response.statusText}`);
            }

            if (!response.body) throw new Error('Response body is null');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullContent = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.trim() === '') continue;
                    if (line.trim() === 'data: [DONE]') break;

                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.replace('data: ', ''));
                            const content = data.choices[0]?.delta?.content || '';
                            if (content) {
                                fullContent += content;
                                options.onContent?.(content);
                            }
                        } catch (e) {
                            console.error('Error parsing Poe stream chunk', e);
                        }
                    }
                }
            }

            options.onDone?.(fullContent);
        } catch (error: any) {
            console.error('Poe API Error:', error);
            options.onError?.(error.message || 'Erro desconhecido ao chamar Poe');
        }
    }
};
