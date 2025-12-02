import React, { useState } from 'react';
import { UserInput } from '../types';

interface WizardFormProps {
  onSubmit: (data: UserInput) => void;
  isLoading: boolean;
}

// Configuration Constants with improved Portuguese descriptions and Apple-style labels
const LEVELS = [
  { value: "iniciante", label: "Iniciante", desc: "Menos de 6 meses de treino ou retornando agora." },
  { value: "intermediário", label: "Intermediário", desc: "1 a 2 anos de treino consistente. Domina a técnica." },
  { value: "avançado", label: "Avançado", desc: "+3 anos de treino sério. Busca performance de elite." }
];

const OBJECTIVES = [
  { value: "hipertrofia", label: "Hipertrofia", desc: "Foco estético: ganhar massa muscular e volume." },
  { value: "condicionamento", label: "Saúde e Condicionamento", desc: "Melhorar fôlego, energia e resistência geral." },
  { value: "força", label: "Força Pura", desc: "Foco em carga máxima e exercícios básicos." },
  { value: "perda de gordura", label: "Perda de Gordura", desc: "Treinos dinâmicos para maximizar gasto calórico." }
];

const EQUIPMENTS = [
  { value: "nenhum", label: "Peso do Corpo", desc: "Treino em casa sem nada." },
  { value: "halteres", label: "Halteres (Dumbbells)", desc: "Pesos livres de mão." },
  { value: "barra fixa", label: "Barra Fixa", desc: "Pull-up bar (porta ou parede)." },
  { value: "banco", label: "Banco", desc: "Reto ou reclinável." },
  { value: "elásticos/bandas", label: "Elásticos", desc: "Superbands ou mini-bands." },
  { value: "barra olímpica", label: "Barra e Anilhas", desc: "Equipamento de academia." },
  { value: "paralelas", label: "Paralelas", desc: "Dip station ou argolas." }
];

const SPLITS = [
  { value: "Fullbody", label: "Corpo Todo (Fullbody)", desc: "Treina tudo todo dia. Ótimo para 2-3x na semana." },
  { value: "Upper/Lower", label: "Superior / Inferior", desc: "Um dia braços/tronco, outro dia pernas. Ideal para 4x." },
  { value: "Push/Pull", label: "Empurrar / Puxar", desc: "Divide por movimento. Dinâmico e eficiente." },
  { value: "PPL", label: "ABC (Push / Pull / Legs)", desc: "Empurrar, Puxar, Pernas. O clássico para 5-6x." }
];

const DAYS_OPTIONS = [
  { short: "Seg", full: "Segunda" },
  { short: "Ter", full: "Terça" },
  { short: "Qua", full: "Quarta" },
  { short: "Qui", full: "Quinta" },
  { short: "Sex", full: "Sexta" },
  { short: "Sáb", full: "Sábado" },
  { short: "Dom", full: "Domingo" }
];

// Reusable UI Components extracted to avoid recreation and fix TS issues
interface TitleProps {
  children: React.ReactNode;
  subtitle?: string;
}

const Title: React.FC<TitleProps> = ({ children, subtitle }) => (
  <div className="mb-6 md:mb-8 text-center md:text-left animate-fade-in">
    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">{children}</h2>
    {subtitle && <p className="text-slate-400 text-sm md:text-base font-medium">{subtitle}</p>}
  </div>
);

interface OptionCardProps {
  selected: boolean;
  onClick: () => void;
  label: string;
  desc?: string;
}

const OptionCard: React.FC<OptionCardProps> = ({ selected, onClick, label, desc }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full p-4 md:p-5 rounded-2xl text-left transition-all duration-200 border group active:scale-[0.98] ${
      selected 
        ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-900/20' 
        : 'bg-[#1c1c1e] border-[#2c2c2e] hover:bg-[#2c2c2e] hover:border-[#3a3a3c]'
    }`}
  >
    <div className="flex flex-col">
      <span className={`font-semibold text-lg mb-1 ${selected ? 'text-white' : 'text-slate-200'}`}>
        {label}
      </span>
      {desc && (
        <span className={`text-sm leading-relaxed ${selected ? 'text-blue-100' : 'text-slate-500 group-hover:text-slate-400'}`}>
          {desc}
        </span>
      )}
    </div>
  </button>
);

const WizardForm: React.FC<WizardFormProps> = ({ onSubmit, isLoading }) => {
  const [step, setStep] = useState(0);
  
  const [formData, setFormData] = useState<UserInput>({
    split: "",
    versao: "",
    dias: [],
    equipamentos: [],
    treinos_com_pesos: "Não",
    objetivo: "",
    nivel: "",
    duracao_por_sessao: 45,
    lesoes: "",
    max_exercicios_por_sessao: 6
  });

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleSelect = (field: keyof UserInput, value: any, autoAdvance = true) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (autoAdvance) {
      setTimeout(nextStep, 250); // Slight delay for ripple effect
    }
  };

  const handleMultiSelect = (field: 'dias' | 'equipamentos', value: string) => {
    setFormData(prev => {
      const list = prev[field];
      if (list.includes(value)) {
        return { ...prev, [field]: list.filter(i => i !== value) };
      }
      return { ...prev, [field]: [...list, value] };
    });
  };

  const finish = () => {
    const hasWeights = formData.equipamentos.some(e => ['halteres', 'barra olímpica', 'kettlebell'].includes(e));
    const versionStr = `${formData.split} ${formData.dias.length}x/semana`;

    const finalData: UserInput = {
      ...formData,
      treinos_com_pesos: hasWeights ? "Sim" : "Não",
      versao: versionStr
    };
    
    onSubmit(finalData);
  };

  // --- STEPS ---

  const ObjectiveStep = () => (
    <div className="space-y-3">
      <Title subtitle="Isso nos ajuda a definir o volume e a intensidade correta para você.">
        Qual é o seu foco principal hoje?
      </Title>
      <div className="grid gap-3">
        {OBJECTIVES.map((opt) => (
          <OptionCard
            key={opt.value}
            label={opt.label}
            desc={opt.desc}
            selected={formData.objetivo === opt.value}
            onClick={() => handleSelect('objetivo', opt.value)}
          />
        ))}
      </div>
    </div>
  );

  const LevelStep = () => (
    <div className="space-y-3">
      <Title subtitle="Seja honesto. Um treino muito avançado pode causar lesões.">
        Como você define sua experiência?
      </Title>
      <div className="grid gap-3">
        {LEVELS.map((opt) => (
          <OptionCard
            key={opt.value}
            label={opt.label}
            desc={opt.desc}
            selected={formData.nivel === opt.value}
            onClick={() => handleSelect('nivel', opt.value)}
          />
        ))}
      </div>
    </div>
  );

  const EquipmentsStep = () => (
    <div className="space-y-4">
      <Title subtitle="Selecione tudo o que você tem acesso. Se não marcar nada, criaremos um treino corporal.">
        Quais equipamentos você tem?
      </Title>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {EQUIPMENTS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleMultiSelect('equipamentos', opt.value)}
            className={`p-4 rounded-2xl text-left border transition-all duration-200 flex items-center justify-between ${
              formData.equipamentos.includes(opt.value)
                ? 'bg-[#1c1c1e] border-blue-500 ring-1 ring-blue-500 text-white' 
                : 'bg-[#1c1c1e] border-[#2c2c2e] text-slate-400 hover:bg-[#2c2c2e]'
            }`}
          >
            <span className="font-medium">{opt.label}</span>
            {formData.equipamentos.includes(opt.value) && (
              <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-[10px] text-white">✓</span>
            )}
          </button>
        ))}
      </div>
      <button 
        onClick={nextStep}
        className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-gray-200 active:scale-[0.98] transition-all"
      >
        Continuar {formData.equipamentos.length > 0 ? `(${formData.equipamentos.length} selecionados)` : '(Só peso do corpo)'}
      </button>
    </div>
  );

  const SplitStep = () => (
    <div className="space-y-3">
      <Title subtitle="Como você prefere dividir seus dias de treino?">
        Escolha a estrutura semanal
      </Title>
      <div className="grid gap-3">
        {SPLITS.map((opt) => (
          <OptionCard
            key={opt.value}
            label={opt.label}
            desc={opt.desc}
            selected={formData.split === opt.value}
            onClick={() => handleSelect('split', opt.value)}
          />
        ))}
      </div>
    </div>
  );

  const DaysStep = () => (
    <div className="space-y-6">
      <Title subtitle="Selecione os dias que você realmente pode treinar. O sistema ajusta o volume automaticamente.">
        Sua agenda de treino
      </Title>
      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
        {DAYS_OPTIONS.map((day) => (
          <button
            key={day.full}
            onClick={() => handleMultiSelect('dias', day.full)}
            className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-sm font-bold border transition-all duration-200 ${
              formData.dias.includes(day.full)
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20 scale-105' 
                : 'bg-[#1c1c1e] border-[#2c2c2e] text-slate-500 hover:border-slate-500'
            }`}
          >
            {day.short}
          </button>
        ))}
      </div>
      <div className="bg-[#1c1c1e] rounded-2xl p-4 border border-[#2c2c2e]">
        <p className="text-slate-400 text-sm text-center">
          Você selecionou <strong className="text-white">{formData.dias.length} dias</strong>. 
          {formData.dias.length < 3 && formData.dias.length > 0 && " (Recomendamos ao menos 3 dias para melhores resultados)"}
        </p>
      </div>
      <button 
        onClick={nextStep}
        disabled={formData.dias.length === 0}
        className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        Continuar
      </button>
    </div>
  );

  const DetailsStep = () => (
    <div className="space-y-8">
      <Title subtitle="Ajustes finais para garantir que o treino caiba na sua rotina e seja seguro.">
        Personalização final
      </Title>
      
      {/* Duration Slider */}
      <div className="bg-[#1c1c1e] p-6 rounded-3xl border border-[#2c2c2e]">
        <div className="flex justify-between items-center mb-4">
            <label className="text-white font-semibold">Duração do Treino</label>
            <span className="text-blue-400 font-bold bg-blue-400/10 px-3 py-1 rounded-lg">
                {formData.duracao_por_sessao} min
            </span>
        </div>
        <input 
            type="range" 
            min="20" max="90" step="5"
            value={formData.duracao_por_sessao}
            onChange={(e) => setFormData(p => ({...p, duracao_por_sessao: parseInt(e.target.value)}))}
            className="w-full h-2 bg-[#2c2c2e] rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
        />
        <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span>Rápido (20m)</span>
            <span>Longo (90m)</span>
        </div>
      </div>

      {/* Injuries */}
      <div className="space-y-3">
        <label className="block text-white font-semibold ml-1">Possui alguma lesão ou dor?</label>
        <textarea 
          value={formData.lesoes}
          onChange={(e) => setFormData(p => ({...p, lesoes: e.target.value}))}
          placeholder="Ex: Dor leve no ombro direito ao elevar o braço, joelho esquerdo estala..."
          className="w-full bg-[#1c1c1e] border border-[#2c2c2e] rounded-2xl p-4 text-white focus:ring-2 focus:ring-blue-500/50 outline-none h-32 resize-none placeholder:text-slate-600 transition-all"
        />
      </div>

      <button 
        onClick={finish}
        disabled={isLoading}
        className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all active:scale-[0.98] ${
          isLoading 
            ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
            : 'bg-white text-black hover:bg-gray-100'
        }`}
      >
        {isLoading ? 'Gerando...' : 'Criar Meu Plano'}
      </button>
    </div>
  );

  const steps = [
    <ObjectiveStep key="obj" />,
    <LevelStep key="lvl" />,
    <EquipmentsStep key="eq" />,
    <SplitStep key="split" />,
    <DaysStep key="days" />,
    <DetailsStep key="det" />
  ];

  return (
    <div className="w-full max-w-2xl mx-auto glass-panel rounded-[2rem] p-6 md:p-10 shadow-2xl animate-fade-in relative overflow-hidden">
      
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-8">
        {step > 0 ? (
          <button 
            onClick={prevStep}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-[#2c2c2e] text-white hover:bg-[#3a3a3c] transition-colors"
          >
            ←
          </button>
        ) : <div className="w-10" />}
        
        <div className="flex gap-2">
           {steps.map((_, i) => (
             <div 
               key={i} 
               className={`h-1.5 rounded-full transition-all duration-300 ${
                 i === step ? 'w-8 bg-blue-500' : 
                 i < step ? 'w-2 bg-blue-900' : 'w-2 bg-[#2c2c2e]'
               }`} 
             />
           ))}
        </div>
        
        <div className="w-10" /> 
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {steps[step]}
      </div>

    </div>
  );
};

export default WizardForm;