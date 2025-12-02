import { GoogleGenAI } from "@google/genai";
import { LLMProvider } from "../llmProvider";

export class GeminiProvider implements LLMProvider {
    private ai: GoogleGenAI;
    private model: string;

    constructor(apiKey: string, model: string) {
        this.ai = new GoogleGenAI({ apiKey });
        this.model = model;
    }

    async generateContent(systemInstruction: string, input: any, jsonMode: boolean = true): Promise<any> {
        const config: any = {};
        if (jsonMode) {
            config.responseMimeType = "application/json";
        }

        try {
            const response = await this.ai.models.generateContent({
                model: this.model,
                contents: JSON.stringify(input),
                config: {
                    ...config,
                    systemInstruction: systemInstruction,
                }
            });

            const text = response.text;
            if (!text) throw new Error("Empty response from AI");

            if (jsonMode) {
                return JSON.parse(text);
            }
            return text;
        } catch (error) {
            console.error("Gemini Error:", error);
            throw error;
        }
    }

    async generateContentWithImage(systemInstruction: string, userMessage: string, imageBase64: string): Promise<string> {
        try {
            // Remove data URL prefix if present
            const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

            const response = await this.ai.models.generateContent({
                model: this.model,
                contents: [
                    {
                        role: "user",
                        parts: [
                            { text: userMessage },
                            {
                                inlineData: {
                                    mimeType: "image/jpeg",
                                    data: base64Data
                                }
                            }
                        ]
                    }
                ],
                config: {
                    systemInstruction: systemInstruction,
                }
            });

            const text = response.text;
            if (!text) throw new Error("Empty response from AI");
            return text;
        } catch (error) {
            console.error("Gemini Vision Error:", error);
            throw error;
        }
    }

    async createChat(systemInstruction: string): Promise<any> {
        return this.ai.chats.create({
            model: this.model,
            config: {
                systemInstruction: systemInstruction,
            }
        });
    }
}
