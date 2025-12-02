import React, { useEffect, useState, useRef } from 'react';
import { AgentLog } from '../types';

interface ProcessingStatusProps {
  logs: AgentLog[];
}

const TIPS = [
  "A consistência supera a intensidade no longo prazo.",
  "Beber água ajuda na recuperação muscular.",
  "O sono é quando seus músculos realmente crescem.",
  "Aquecer previne lesões e melhora a performance.",
  "A técnica correta vale mais que o peso na barra.",
  "Escute seu corpo: dor aguda é sinal de parar.",
  "Proteína é essencial para reparar tecidos.",
  "Descanse pelo menos 48h antes de treinar o mesmo músculo intensamente.",
  "A respiração correta ajuda a estabilizar o core.",
  "Resultados visíveis levam de 4 a 8 semanas. Tenha paciência."
];

const TOTAL_STEPS = 7; // Wizard -> Logic -> C -> D -> E -> F -> G

const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ logs }) => {
  const [currentTip, setCurrentTip] = useState(0);
  const [fade, setFade] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Calculate Progress
  const completedSteps = logs.filter(l => l.status === 'completed').length;
  const progress = Math.min(Math.round((completedSteps / TOTAL_STEPS) * 100), 100);
  
  // Find current active task
  const currentTask = logs.find(l => l.status === 'running') || logs[logs.length - 1];

  // Rotate Tips
  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false); // Fade out
      setTimeout(() => {
        setCurrentTip((prev) => (prev + 1) % TIPS.length);
        setFade(true); // Fade in
      }, 500);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      
      {/* Main Glass Panel */}
      <div className="bg-[#1c1c1e]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-blue-500/50 blur-[20px]" />

        {/* Header & Percentage */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <h3 className="text-white font-semibold text-lg tracking-tight">Criando seu Plano</h3>
            <p className="text-slate-400 text-sm">Nossa IA está analisando seu perfil...</p>
          </div>
          <div className="text-right">
            <span className="text-4xl font-bold text-white tracking-tighter">{progress}%</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 bg-[#2c2c2e] rounded-full overflow-hidden mb-8">
          <div 
            className="h-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)] transition-all duration-700 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Dynamic Tips Section */}
        <div className="mb-8 h-16 flex items-center justify-center text-center border-y border-white/5 py-4">
           <p className={`text-slate-300 font-medium italic transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}>
             "{TIPS[currentTip]}"
           </p>
        </div>

        {/* Active Task Indicator */}
        <div className="flex items-center gap-3 mb-6 bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
           <div className="w-5 h-5 relative flex items-center justify-center">
             <div className="absolute inset-0 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
           </div>
           <div className="flex-1">
             <p className="text-blue-200 text-sm font-semibold uppercase tracking-wide text-[10px] mb-0.5">
               Processando Agora
             </p>
             <p className="text-white text-sm font-medium">
               {currentTask ? currentTask.message : "Iniciando..."}
             </p>
           </div>
        </div>

        {/* Minimal Log History */}
        <div 
          ref={scrollRef}
          className="max-h-[100px] overflow-y-auto space-y-3 custom-scrollbar pr-2"
        >
          {logs.filter(l => l.status === 'completed').map((log, idx) => (
            <div key={idx} className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
              <span className="text-xs text-slate-400 font-mono">
                [{log.agent}] <span className="text-slate-300">{log.message}</span>
              </span>
            </div>
          ))}
        </div>

      </div>
      
      {/* Footer Text */}
      <p className="text-center text-slate-500 text-xs mt-4 animate-pulse">
        Isso pode levar cerca de 30 a 60 segundos. Não feche a página.
      </p>

    </div>
  );
};

export default ProcessingStatus;
