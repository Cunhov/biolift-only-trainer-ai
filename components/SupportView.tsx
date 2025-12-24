import React, { useState, useEffect, useRef } from 'react';
import { SavedWorkout } from '../types';
import { poe } from '../services/poe';
import { auth, support } from '../services/api';
import { getSupportSystemPrompt } from '../utils/prompts';

interface SupportViewProps {
  onBack: () => void;
  workoutContext?: SavedWorkout;
}

interface Message {
  id: string;
  role: 'user' | 'coach';
  text: string;
  timestamp: Date;
}

const SupportView: React.FC<SupportViewProps> = ({ onBack, workoutContext }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'coach',
      text: workoutContext
        ? `Opa! Sou a Alice, sua personal do BioLift! 💪\n\nVi que você tá olhando o treino "${workoutContext.title}". Bora tirar suas dúvidas sobre ele?`
        : `Opa! Sou a Alice, sua personal do BioLift! 🌟\n\nEm que posso te ajudar hoje? Pode me perguntar sobre treinos, funcionalidades do app, ou qualquer dúvida que tiver!`,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [allWorkouts, setAllWorkouts] = useState<SavedWorkout[]>([]);
  const pendingUserMessages = useRef<string[]>([]);
  const bufferTimeout = useRef<NodeJS.Timeout | null>(null);
  const messagesRef = useRef<Message[]>(messages);

  // Update ref when messages change
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionId = useRef(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const currentUser = auth.me();

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input on mount & Load context
  useEffect(() => {
    inputRef.current?.focus();
    const loadContext = async () => {
      try {
        const user = auth.me();
        if (user) {
          const { workouts } = await import('../services/api');
          const response = await workouts.getAll();
          setAllWorkouts(response.data || []);
        }
      } catch (e) {
        console.error("Failed to load Alice context", e);
      }
    };
    loadContext();
  }, []);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();

    const trimmedInput = inputText.trim();
    if (!trimmedInput) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: trimmedInput,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // Add to buffer
    pendingUserMessages.current.push(trimmedInput);

    // Skip log for now, log bundled messages later or log individually
    if (currentUser) {
      support.logMessage({
        userId: currentUser.id,
        role: 'user',
        message: trimmedInput,
        sessionId: sessionId.current,
        workoutContextId: workoutContext?.id
      });
    }

    // Reset buffer timeout (5 seconds)
    if (bufferTimeout.current) clearTimeout(bufferTimeout.current);

    setIsTyping(true);
    bufferTimeout.current = setTimeout(() => {
      processBuffer();
    }, 5000);
  };

  const processBuffer = async () => {
    if (pendingUserMessages.current.length === 0) return;

    const bundledInput = pendingUserMessages.current.join('\n');
    pendingUserMessages.current = []; // Clear buffer

    try {
      // Build conversation history for context (excluding the new bundled messages already in UI)
      // Use the latest messages from ref
      const history = messagesRef.current.map((m) => ({
        role: m.role === 'coach' ? 'assistant' : 'user',
        content: m.text
      })) as any[];

      const systemPrompt = getSupportSystemPrompt(allWorkouts, workoutContext);

      await poe.chat({
        messages: [{ role: 'system', content: systemPrompt }, ...history, { role: 'user', content: bundledInput }],
        onContent: () => { },
        onDone: async (fullContent) => {
          // Split by double newline or triple newline for "human-like" bubbles
          const bubbles = fullContent.split(/\n\n+/).filter(b => b.trim());

          for (let i = 0; i < bubbles.length; i++) {
            const bubble = bubbles[i];

            // Artificial delay between bubbles to feel human (longer for longer text)
            if (i > 0) {
              const delay = Math.min(2000, bubble.length * 15);
              await new Promise(r => setTimeout(r, delay));
            }

            const coachMsgId = `coach_${Date.now()}_${i}`;
            setMessages((prev) => [
              ...prev,
              {
                id: coachMsgId,
                role: 'coach',
                text: bubble,
                timestamp: new Date()
              }
            ]);

            // Log Coach Message
            if (currentUser) {
              support.logMessage({
                userId: currentUser.id,
                role: 'coach',
                message: bubble,
                sessionId: sessionId.current,
                workoutContextId: workoutContext?.id
              });
            }
          }

          setIsTyping(false);
          inputRef.current?.focus();
        },
        onError: (err) => {
          console.error(err);
          setMessages((prev) => [
            ...prev,
            {
              id: `error_${Date.now()}`,
              role: 'coach',
              text: 'Ops, tive um problema de conexão. Tente novamente!',
              timestamp: new Date()
            }
          ]);
          setIsTyping(false);
        }
      });
    } catch (err) {
      console.error('Support chat error:', err);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto h-[calc(100vh-8rem)] flex flex-col animate-fade-in relative">
      <button
        onClick={onBack}
        className="absolute top-0 left-0 -mt-12 flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium group"
      >
        <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Voltar
      </button>

      {/* Chat Container */}
      <div className="flex-1 bg-gradient-to-br from-slate-900/95 to-slate-800/95 rounded-[2rem] flex flex-col overflow-hidden border border-slate-700/50 backdrop-blur-xl shadow-2xl">

        {/* Header */}
        <div className="p-5 border-b border-slate-700/50 flex items-center gap-4 bg-gradient-to-r from-slate-800/50 to-slate-800/30">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg text-lg">
              ✨
            </div>
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse"></span>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-white text-lg">Alice</h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-sm text-slate-400">Sua Personal do BioLift</span>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-gradient-to-b from-transparent to-slate-900/20">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div
                className={`max-w-[85%] md:max-w-[70%] rounded-2xl text-sm leading-relaxed shadow-lg transition-all hover:scale-[1.02] ${msg.role === 'user'
                  ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-tr-md p-4'
                  : 'bg-gradient-to-br from-slate-800/80 to-slate-800/60 text-slate-100 rounded-tl-md border border-slate-700/50 p-4 backdrop-blur-sm'
                  }`}
              >
                <div className="whitespace-pre-wrap break-words">{msg.text}</div>
                <div className={`text-xs mt-2 ${msg.role === 'user' ? 'text-blue-200' : 'text-slate-500'}`}>
                  {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-800/60 backdrop-blur-sm p-4 rounded-2xl rounded-tl-md flex gap-1.5 items-center border border-slate-700/50">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-5 bg-gradient-to-t from-slate-800/50 to-transparent border-t border-slate-700/50">
          <form onSubmit={handleSend} className="relative">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua dúvida... (Enter para enviar)"
              disabled={isTyping}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-2xl pl-5 pr-24 py-4 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
            />

            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                className="p-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shadow-lg disabled:hover:from-blue-600 disabled:hover:to-blue-500"
                title="Enviar mensagem (Enter)"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default SupportView;
