// LLM Provider Interface
export interface LLMProvider {
    generateContent(systemInstruction: string, input: any, jsonMode?: boolean): Promise<any>;
    generateContentWithImage(systemInstruction: string, userMessage: string, imageBase64: string): Promise<string>;
    createChat(systemInstruction: string): Promise<any>;
}

export interface LLMConfig {
    provider: 'gemini' | 'openai' | 'custom';
    model: string;
    apiKey: string;
    baseUrl?: string;
}

export function getLLMConfig(): LLMConfig {
    const provider = (process.env.LLM_PROVIDER || 'gemini') as LLMConfig['provider'];
    const model = process.env.LLM_MODEL || 'gemini-2.5-flash';
    const apiKey = process.env.LLM_API_KEY || process.env.API_KEY || '';
    const baseUrl = process.env.LLM_BASE_URL;

    if (!apiKey) {
        throw new Error('LLM_API_KEY or API_KEY must be set in environment variables');
    }

    return { provider, model, apiKey, baseUrl };
}
