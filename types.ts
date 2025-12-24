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
  status: 'pending' | 'processing' | 'completed' | 'error' | 'success';
  message: string;
}

export interface SavedWorkout {
  id: string;
  title: string;
  date: string;
  content: string; // Markdown content
  originalInput: UserInput;
  userId?: string;
  createdAt?: any;
  updatedAt?: any;
}

export type ProcessingState = 'input' | 'processing' | 'result' | 'error';

export type AppView = 'login' | 'dashboard' | 'wizard' | 'processing' | 'view_workout' | 'support' | 'admin';
