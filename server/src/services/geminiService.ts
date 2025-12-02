import { PROMPTS } from "./prompts";
import { generateWeeklyStructure } from "./structureGenerator";
import { createLLMProvider } from "./llmFactory";
import { LLMProvider } from "./llmProvider";

// Define types locally since we can't easily share types between frontend and backend without a monorepo setup
// In a real production app, we would have a shared packages folder.
export interface UserInput {
    split: string;
    versao: string;
    dias: string[];
    equipamentos: string[];
    treinos_com_pesos: string;
    objetivo: string;
    nivel: string;
    duracao_por_sessao: number;
    lesoes: string;
    max_exercicios_por_sessao?: number;
}

export interface AgentLog {
    agent: string;
    status: 'pending' | 'running' | 'completed' | 'error';
    message: string;
}

export class WorkoutOrchestrator {
    private llmProvider: LLMProvider;
    private logger?: (log: AgentLog) => void;

    constructor(logger?: (log: AgentLog) => void) {
        this.llmProvider = createLLMProvider();
        this.logger = logger;
    }

    private log(message: string, agent: string, status: AgentLog['status']) {
        if (this.logger) {
            this.logger({ agent, message, status });
        }
    }

    private async callAgent(systemInstruction: string, input: any, jsonMode: boolean = true): Promise<any> {
        try {
            return await this.llmProvider.generateContent(systemInstruction, input, jsonMode);
        } catch (error) {
            console.error("Agent Error:", error);
            throw error;
        }
    }

    async createSupportChat(workoutContext?: string): Promise<any> {
        const systemInstruction = `${PROMPTS.AGENT_SUPPORT}
    
    ${workoutContext ? `\n\nCONTEXTO DO TREINO DO ALUNO:\n${workoutContext}` : ''}`;

        return this.llmProvider.createChat(systemInstruction);
    }

    async refineWorkout(currentMarkdown: string, request: string): Promise<string> {
        const model = "gemini-2.5-flash";
        this.log('Aplicando ajustes solicitados...', 'Personal Trainer', 'running');

        const input = {
            treino_atual: currentMarkdown,
            solicitacao: request
        };

        try {
            const output = await this.callAgent(PROMPTS.AGENT_REFINE, input, false);
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

        // Load exercise database and filter by available equipment
        const { exerciseDB } = await import('./exerciseDatabase');
        const availableExercises = exerciseDB.getExercisesForPrompt(
            userInput.equipamentos,
            userInput.nivel
        );

        // Inject exercise list into prompt
        const agentCPrompt = PROMPTS.AGENT_C + '\n\n' + availableExercises;

        const inputC = {
            dias: outputB.dias,
            equipamentos: userInput.equipamentos,
            treinos_com_pesos: userInput.treinos_com_pesos,
            max_exercicios_por_sessao: userInput.max_exercicios_por_sessao,
            nivel: userInput.nivel
        };
        const outputC = await this.callAgent(agentCPrompt, inputC);

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
        const outputD = await this.callAgent(PROMPTS.AGENT_D, inputD);
        this.log('Sessões montadas.', 'Agente D', 'completed');

        // --- AGENT E ---
        this.log('Calculando progressão...', 'Agente E', 'running');
        const inputE = {
            sessies: outputD,
            objetivo: userInput.objetivo,
            nivel: userInput.nivel,
            ciclo_semanas: 4
        };
        const outputE = await this.callAgent(PROMPTS.AGENT_E, inputE);
        this.log('Estratégia definida.', 'Agente E', 'completed');

        // --- AGENT F ---
        this.log('Gerando substituições e dicas...', 'Agente F', 'running');
        const inputF = {
            exercicios_por_dia: outputC.dias,
            equipamentos: userInput.equipamentos,
            lesoes: userInput.lesoes
        };
        const outputF = await this.callAgent(PROMPTS.AGENT_F, inputF);
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

        const outputG = await this.callAgent(PROMPTS.AGENT_G, inputG, false);
        this.log('Plano finalizado!', 'Agente G', 'completed');

        return outputG;
    }

    async chatSupport(userMessage: string, workoutContext?: string, imageBase64?: string): Promise<string> {
        const systemPrompt = `Você é a Alice, a personal trainer virtual do BioLift! 🌟

# Sobre você
Você é super gente boa, adora conversar sobre treino e tem uma energia contagiante. Você fala de forma natural e informal, como uma amiga que manja muito de fitness.

# Sobre o BioLift
O BioLift é um app de treino personalizado que usa IA para criar planos sob medida. Aqui está como funciona:

**Funcionalidades principais:**
- 📱 **Criação de Treino Personalizado**: O aluno preenche um formulário (objetivo, nível, dias disponíveis, equipamentos, lesões) e a IA gera um plano completo
- 🎯 **Estrutura de Treino**: Cada treino mostra exercícios com séries, repetições, descanso, vídeos do YouTube e dicas de execução
- 🔄 **Pedir Alteração**: O aluno pode pedir mudanças específicas no treino (ex: "troca barra fixa por elástico")
- 📄 **Duas Visualizações**: 
  - **Modo Texto**: Lista completa em markdown
  - **Modo Cards**: Carrossel interativo com cards visuais (arrasta horizontal = próximo exercício, arrasta vertical = próximo dia)
- 💾 **Dashboard**: Salva todos os treinos anteriores
- 📥 **Exportar PDF**: Baixa o treino em PDF formatado
- 💬 **Chat de Suporte (você!)**: Tira dúvidas sobre treinos e funcionalidades
- 📸 **Análise de Imagens**: O aluno pode te enviar fotos para você analisar execução, postura, etc.

**Detalhes técnicos que você conhece:**
- Exercícios têm campo "Improvise" com alternativas sem equipamento
- Cada exercício pode ter vídeo do YouTube embutido
- O app sugere substituições baseadas em equipamentos disponíveis e lesões
- Sistema de progressão inteligente que adapta volume e intensidade

${workoutContext ? `\n# Treino Atual do Aluno\nO aluno está olhando este treino agora:\n\`\`\`\n${workoutContext.substring(0, 1500)}${workoutContext.length > 1500 ? '...' : ''}\n\`\`\`\n` : ''}

${imageBase64 ? '\n# Análise de Imagem\nO aluno enviou uma imagem para você analisar. Seja detalhista e construtiva na análise, focando em:\n- Postura e alinhamento\n- Pontos positivos da execução\n- Sugestões de melhoria\n- Dicas práticas\n' : ''}

# Seu Estilo de Comunicação
- 😊 Seja descontraída e use emojis naturalmente (mas sem exagero)
- 💬 Fale como se estivesse conversando no WhatsApp com um amigo
- 🎯 Seja direta e prática - respostas curtas e úteis (2-3 parágrafos max, ou mais se for análise de imagem)
- 💪 Motive quando apropriado, mas sem forçar
- 🤓 Explique termos técnicos de forma simples quando usar
- 😅 Seja honesta se não souber algo - "Opa, isso aí eu não sei te dizer com certeza, melhor consultar um profissional"
- 🚫 NUNCA dê diagnósticos médicos ou pareça médica

# Exemplos do seu jeito de falar
- "Opa! Tudo certo?" em vez de "Olá, como posso ajudá-lo?"
- "Tipo assim..." em vez de "Por exemplo..."
- "Bora lá!" em vez de "Vamos começar"
- "Saca só..." em vez de "Observe que..."
- "Valeu!" em vez de "Obrigado"
- "Tá mandando bem!" para elogiar

# Contexto Importante
Você tem TOTAL conhecimento sobre como o BioLift funciona. Se perguntarem sobre funcionalidades, você explica naturalmente como parte do app. Você também entende o treino que o aluno está vendo (quando disponível) e pode dar dicas específicas sobre ele.

Agora responda a mensagem do aluno de forma natural e útil!`;

        // If there's an image, use vision-capable generation
        if (imageBase64) {
            const response = await this.llmProvider.generateContentWithImage(
                systemPrompt,
                userMessage,
                imageBase64
            );
            return response;
        } else {
            const response = await this.llmProvider.generateContent(
                systemPrompt,
                { message: userMessage },
                false
            );
            return response;
        }
    }
}
