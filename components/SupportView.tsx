import React, { useState, useEffect, useRef } from 'react';
import { SavedWorkout } from '../types';
import { API_URL } from '../config';

interface SupportViewProps {
  onBack: () => void;
  workoutContext?: SavedWorkout;
}

interface Message {
  id: string;
  role: 'user' | 'coach';
  text: string;
  timestamp: Date;
  image?: string; // base64 image data
}

const SupportView: React.FC<SupportViewProps> = ({ onBack, workoutContext }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'coach',
      text: workoutContext
        ? `Opa! Sou a Alice, sua personal do BioLift! 💪\n\nVi que você tá olhando o treino "${workoutContext.title}". Bora tirar suas dúvidas sobre ele?`
        : `Opa! Sou a Alice, sua personal do BioLift! 🌟\n\nEm que posso te ajudar hoje? Pode me perguntar sobre treinos, funcionalidades do app, ou qualquer dúvida que tiver!\n\n(Dica: Você também pode me enviar fotos para eu analisar sua execução! 📸)`,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Imagem muito grande! Por favor, escolha uma imagem menor que 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();

    const trimmedInput = inputText.trim();
    if ((!trimmedInput && !selectedImage) || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: trimmedInput || '📷 [Imagem enviada]',
      timestamp: new Date(),
      image: selectedImage || undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    const imageToSend = selectedImage;
    setSelectedImage(null);
    setIsTyping(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/ai/support`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: trimmedInput || 'Analise esta imagem',
          workoutContext: workoutContext?.content,
          image: imageToSend
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to get response');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event = JSON.parse(line.replace('data: ', ''));
              if (event.type === 'content') {
                fullResponse += event.content;
              }
            } catch (e) {
              console.error('Error parsing SSE', e);
            }
          }
        }
      }

      if (fullResponse) {
        const coachMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'coach',
          text: fullResponse,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, coachMsg]);
      } else {
        throw new Error('Empty response');
      }

    } catch (err) {
      console.error('Support chat error:', err);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'coach',
        text: "Opa, deu algum problema aqui... 😅 Pode tentar de novo?",
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
      if (fileInputRef.current) fileInputRef.current.value = '';
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
          <div className="text-xs text-slate-500">
            {messages.length - 1} mensagem{messages.length - 1 !== 1 ? 's' : ''}
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
                {msg.image && (
                  <img
                    src={msg.image}
                    alt="Imagem enviada"
                    className="rounded-lg mb-2 max-w-full h-auto"
                  />
                )}
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

        {/* Image Preview */}
        {selectedImage && (
          <div className="px-5 py-3 border-t border-slate-700/50 bg-slate-800/30">
            <div className="flex items-center gap-3">
              <img src={selectedImage} alt="Preview" className="w-16 h-16 rounded-lg object-cover" />
              <div className="flex-1 text-sm text-slate-400">Imagem pronta para enviar</div>
              <button
                onClick={() => setSelectedImage(null)}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

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

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />

            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isTyping || !!selectedImage}
                className="p-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                title="Enviar imagem"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>

              <button
                type="submit"
                disabled={(!inputText.trim() && !selectedImage) || isTyping}
                className="p-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shadow-lg disabled:hover:from-blue-600 disabled:hover:to-blue-500"
                title="Enviar mensagem (Enter)"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
          <div className="mt-2 text-xs text-slate-500 text-center">
            {selectedImage ? '📸 Imagem selecionada • ' : ''}Enter = enviar • 📎 = anexar imagem
          </div>
        </div>

      </div>
    </div>
  );
};

export default SupportView;
