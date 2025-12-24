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
            let isThinking = false;

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

                                // HEURISTIC 1: DeepSeek/Reasoning models use <think> tags
                                if (content.includes('<think>')) isThinking = true;
                                if (content.includes('</think>')) {
                                    isThinking = false;
                                    continue; // Skip the closing tag chunk if it's just that
                                }

                                // HEURISTIC 2: Skip explicit "Thinking..." lines and blockquotes at the start
                                if (fullContent.length < 500) {
                                    if (content.includes('*Thinking...*')) continue;
                                    if (content.trim().startsWith('>')) continue;
                                    if (fullContent.trim().startsWith('>')) continue;
                                }

                                if (!isThinking) {
                                    options.onContent?.(content);
                                }
                            }
                        } catch (e) {
                            console.error('Error parsing Poe stream chunk', e);
                        }
                    }
                }
            }

            // Final Cleanup ensuring no leaked thinking artifacts remain
            fullContent = fullContent
                .replace(/<think>[\s\S]*?<\/think>/g, '')
                .replace(/\*Thinking\.\.\.\*[\s\S]*?(?=\n\n|\n>|\n#)/g, '')
                .replace(/^\s*>\s.*/gm, '')
                .trim();

            options.onDone?.(fullContent);
        } catch (error: any) {
            console.error('Poe API Error:', error);
            options.onError?.(error.message || 'Erro desconhecido ao chamar Poe');
        }
    }
};
