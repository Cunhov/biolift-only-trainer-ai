import { LLMProvider, LLMConfig, getLLMConfig } from "./llmProvider";
import { GeminiProvider } from "./providers/geminiProvider";
import { OpenAIProvider } from "./providers/openaiProvider";
import { CustomProvider } from "./providers/customProvider";

export function createLLMProvider(config?: LLMConfig): LLMProvider {
    const llmConfig = config || getLLMConfig();

    switch (llmConfig.provider) {
        case 'gemini':
            return new GeminiProvider(llmConfig.apiKey, llmConfig.model);

        case 'openai':
            return new OpenAIProvider(llmConfig.apiKey, llmConfig.model, llmConfig.baseUrl);

        case 'custom':
            if (!llmConfig.baseUrl) {
                throw new Error('LLM_BASE_URL must be set when using custom provider');
            }
            return new CustomProvider(llmConfig.apiKey, llmConfig.model, llmConfig.baseUrl);

        default:
            throw new Error(`Unknown LLM provider: ${llmConfig.provider}`);
    }
}
