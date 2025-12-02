import OpenAI from "openai";
import { LLMProvider } from "../llmProvider";

export class OpenAIProvider implements LLMProvider {
    private client: OpenAI;
    private model: string;

    constructor(apiKey: string, model: string, baseUrl?: string) {
        this.client = new OpenAI({
            apiKey,
            ...(baseUrl && { baseURL: baseUrl })
        });
        this.model = model;
    }

    async generateContent(systemInstruction: string, input: any, jsonMode: boolean = true): Promise<any> {
        try {
            const messages: any[] = [
                { role: "system", content: systemInstruction },
                { role: "user", content: JSON.stringify(input) }
            ];

            const params: any = {
                model: this.model,
                messages,
            };

            if (jsonMode) {
                params.response_format = { type: "json_object" };
            }

            const response = await this.client.chat.completions.create(params);
            const text = response.choices[0]?.message?.content;

            if (!text) throw new Error("Empty response from OpenAI");

            if (jsonMode) {
                return JSON.parse(text);
            }
            return text;
        } catch (error) {
            console.error("OpenAI Error:", error);
            throw error;
        }
    }

    async generateContentWithImage(systemInstruction: string, userMessage: string, imageBase64: string): Promise<string> {
        try {
            const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

            const response = await this.client.chat.completions.create({
                model: this.model,
                messages: [
                    { role: "system", content: systemInstruction },
                    {
                        role: "user",
                        content: [
                            { type: "text", text: userMessage },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:image/jpeg;base64,${base64Data}`
                                }
                            }
                        ]
                    }
                ]
            });

            return response.choices[0]?.message?.content || "";
        } catch (error) {
            console.error("OpenAI Vision Error:", error);
            throw error;
        }
    }

    async createChat(systemInstruction: string): Promise<any> {
        // For OpenAI, we'll return a simple wrapper that maintains conversation history
        const messages: any[] = [
            { role: "system", content: systemInstruction }
        ];

        return {
            send: async (userMessage: string) => {
                messages.push({ role: "user", content: userMessage });

                const response = await this.client.chat.completions.create({
                    model: this.model,
                    messages,
                });

                const assistantMessage = response.choices[0]?.message?.content || "";
                messages.push({ role: "assistant", content: assistantMessage });

                return { text: assistantMessage };
            }
        };
    }
}
