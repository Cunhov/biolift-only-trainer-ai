import axios from "axios";
import { LLMProvider } from "../llmProvider";

export class CustomProvider implements LLMProvider {
    private apiKey: string;
    private model: string;
    private baseUrl: string;

    constructor(apiKey: string, model: string, baseUrl: string) {
        this.apiKey = apiKey;
        this.model = model;
        this.baseUrl = baseUrl;
    }

    async generateContent(systemInstruction: string, input: any, jsonMode: boolean = true): Promise<any> {
        try {
            // Generic implementation for OpenAI-compatible APIs (Anthropic, local LLMs, etc.)
            const response = await axios.post(
                `${this.baseUrl}/chat/completions`,
                {
                    model: this.model,
                    messages: [
                        { role: "system", content: systemInstruction },
                        { role: "user", content: JSON.stringify(input) }
                    ],
                    ...(jsonMode && { response_format: { type: "json_object" } })
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const text = response.data.choices[0]?.message?.content;
            if (!text) throw new Error("Empty response from Custom API");

            if (jsonMode) {
                return JSON.parse(text);
            }
            return text;
        } catch (error) {
            console.error("Custom Provider Error:", error);
            throw error;
        }
    }

    async generateContentWithImage(systemInstruction: string, userMessage: string, imageBase64: string): Promise<string> {
        try {
            const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

            const response = await axios.post(
                `${this.baseUrl}/chat/completions`,
                {
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
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data.choices[0]?.message?.content || "";
        } catch (error) {
            console.error("Custom Provider Vision Error:", error);
            throw error;
        }
    }

    async createChat(systemInstruction: string): Promise<any> {
        const messages: any[] = [
            { role: "system", content: systemInstruction }
        ];

        return {
            send: async (userMessage: string) => {
                messages.push({ role: "user", content: userMessage });

                const response = await axios.post(
                    `${this.baseUrl}/chat/completions`,
                    {
                        model: this.model,
                        messages,
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${this.apiKey}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                const assistantMessage = response.data.choices[0]?.message?.content || "";
                messages.push({ role: "assistant", content: assistantMessage });

                return { text: assistantMessage };
            }
        };
    }
}
