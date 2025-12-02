
import { GoogleGenAI, ChatSession } from "@google/genai";
import { PROMPTS } from "./prompts";
import { UserInput, AgentLog } from "../types";
import { generateWeeklyStructure } from "./structureGenerator";

export class WorkoutOrchestrator {
  private ai: GoogleGenAI;
  private logger?: (log: AgentLog) => void;

  constructor(logger?: (log: AgentLog) => void) {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key not found in process.env.API_KEY");
    }
    this.ai = new GoogleGenAI({ apiKey });
    this.logger = logger;
  }

  private log(message: string, agent: string, status: AgentLog['status']) {
    if (this.logger) {
      this.logger({ agent, message, status });
    }
  }

  private async callAgent(modelName: string, systemInstruction: string, input: any, jsonMode: boolean = true): Promise<any> {
    const config: any = {};
    if (jsonMode) {
      config.responseMimeType = "application/json";
    }

    try {
      const response = await this.ai.models.generateContent({
        model: modelName,
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
      console.error("Agent Error:", error);
      throw error;
    }
  }

  async createSupportChat(workoutContext?: string): Promise<ChatSession> {
    const systemInstruction = `${PROMPTS.AGENT_SUPPORT}
    
    ${workoutContext ? `\n\nCONTEXTO DO TREINO DO ALUNO:\n${workoutContext}` : ''}`;

    return this.ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemInstruction,
      }
    });
  }

  async refineWorkout(currentMarkdown: string, request: string): Promise<string> {
    const model = "gemini-2.5-flash";
    this.log('Aplicando ajustes solicitados...', 'Personal Trainer', 'running');
    
    const input = {
      treino_atual: currentMarkdown,
      solicitacao: request
    };

    try {
      const output = await this.callAgent(model, PROMPTS.AGENT_REFINE, input, false);
      this.log('Treino atualizado com sucesso.', 'Personal Trainer', 'completed');
      return output;
    } catch (error) {
      this.log('Falha ao atualizar treino.', 'Personal Trainer', 'error');
      throw error;
    }
  }

  async runOrchestration(userInput: UserInput) {
    const model = "gemini-2.5-flash"; 

    // --- AGENT A (REMOVED) ---
    this.log('Parâmetros capturados e validados.', 'Wizard UI', 'completed');

    // --- AGENT B (REPLACED BY CODE) ---
    this.log('Calculando estrutura semanal...', 'Logic Service', 'running');
    
    // Use deterministic code logic to generate structure instead of AI
    const outputB = generateWeeklyStructure(userInput);
    
    // Simulate slight delay for UX
    await new Promise(r => setTimeout(r, 600)); 
    
    this.log('Estrutura gerada com sucesso.', 'Logic Service', 'completed');

    // --- AGENT C ---
    this.log('Selecionando exercícios (IA)...', 'Agente C', 'running');
    const inputC = {
      dias: outputB.dias,
      equipamentos: userInput.equipamentos,
      treinos_com_pesos: userInput.treinos_com_pesos,
      max_exercicios_por_sessao: userInput.max_exercicios_por_sessao,
      nivel: userInput.nivel
    };
    const outputC = await this.callAgent(model, PROMPTS.AGENT_C, inputC);
    
    if (outputC.erro) {
      throw new Error(`Erro na seleção de exercícios: ${outputC.mensagem}`);
    }
    this.log('Exercícios selecionados.', 'Agente C', 'completed');

    // --- AGENT D ---
    this.log('Montando sessões detalhadas...', 'Agente D', 'running');
    const inputD = {
      dias: outputC.dias,
      exercicios: outputC.dias,
      objetivo: userInput.objetivo,
      nivel: userInput.nivel,
      duracao_por_sessao: userInput.duracao_por_sessao,
      max_exercicios_por_sessao: userInput.max_exercicios_por_sessao
    };
    const outputD = await this.callAgent(model, PROMPTS.AGENT_D, inputD);
    this.log('Sessões montadas.', 'Agente D', 'completed');

    // --- AGENT E ---
    this.log('Calculando progressão...', 'Agente E', 'running');
    const inputE = {
      sessies: outputD,
      objetivo: userInput.objetivo,
      nivel: userInput.nivel,
      ciclo_semanas: 4
    };
    const outputE = await this.callAgent(model, PROMPTS.AGENT_E, inputE);
    this.log('Estratégia definida.', 'Agente E', 'completed');

    // --- AGENT F ---
    this.log('Gerando substituições e dicas...', 'Agente F', 'running');
    const inputF = {
      exercicios_por_dia: outputC.dias,
      equipamentos: userInput.equipamentos,
      lesoes: userInput.lesoes
    };
    const outputF = await this.callAgent(model, PROMPTS.AGENT_F, inputF);
    this.log('Dicas geradas.', 'Agente F', 'completed');

    // --- AGENT G ---
    this.log('Formatando documento final...', 'Agente G', 'running');
    const inputG = {
      sessoes_detalhadas: outputD,
      progressao_volume: outputE,
      substituicoes_dicas: outputF,
      parametros_validados: userInput, // Passed directly
      preferencia_formato: "séries+reps"
    };
    
    const outputG = await this.callAgent("gemini-2.5-flash", PROMPTS.AGENT_G, inputG, false);
    this.log('Plano finalizado!', 'Agente G', 'completed');

    return outputG;
  }
}
