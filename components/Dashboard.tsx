import React from 'react';
import { SavedWorkout } from '../types';

interface DashboardProps {
  workouts: SavedWorkout[];
  onCreateNew: () => void;
  onSelectWorkout: (workout: SavedWorkout) => void;
  onSupport: () => void;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ workouts, onCreateNew, onSelectWorkout, onSupport, onLogout }) => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Meus Treinos</h1>
          <p className="text-slate-400">Gerencie seus planos e evolução.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onLogout}
            className="px-5 py-2.5 rounded-full bg-red-600/10 text-red-400 font-medium hover:bg-red-600/20 transition-colors border border-red-500/30"
          >
            Sair
          </button>
          <button
            onClick={onSupport}
            className="px-5 py-2.5 rounded-full bg-slate-800 text-slate-200 font-medium hover:bg-slate-700 transition-colors border border-slate-700"
          >
            Suporte
          </button>
          <button
            onClick={onCreateNew}
            className="px-5 py-2.5 rounded-full bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20"
          >
            + Novo Treino
          </button>
        </div>
      </div>

      {/* Grid */}
      {workouts.length === 0 ? (
        <div className="glass-panel rounded-[2rem] p-12 text-center border-dashed border-2 border-white/10">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">💪</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Nenhum treino criado ainda</h3>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Parece que você ainda não começou. Crie seu primeiro plano personalizado agora mesmo!
          </p>
          <button
            onClick={onCreateNew}
            className="text-blue-400 hover:text-blue-300 font-semibold"
          >
            Começar Agora &rarr;
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workouts.map((workout) => (
            <button
              key={workout.id}
              onClick={() => onSelectWorkout(workout)}
              className="group text-left glass-panel p-6 rounded-3xl hover:bg-white/5 hover:border-blue-500/30 transition-all duration-300 active:scale-[0.98] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>

              <span className="inline-block px-3 py-1 bg-blue-500/10 text-blue-300 text-xs font-bold rounded-lg mb-3 uppercase tracking-wider">
                {workout.originalInput.objetivo}
              </span>

              <h3 className="text-xl font-bold text-white mb-1 line-clamp-1 group-hover:text-blue-200 transition-colors">
                {workout.title}
              </h3>

              <div className="text-slate-500 text-sm flex gap-3 mb-4">
                <span>{new Date(workout.date).toLocaleDateString()}</span>
                <span>•</span>
                <span>{workout.originalInput.versao}</span>
              </div>

              <div className="flex gap-2 mt-2">
                {workout.originalInput?.equipamentos?.slice(0, 3).map((eq, i) => (
                  <span key={i} className="text-[10px] bg-white/5 px-2 py-1 rounded text-slate-400 border border-white/5">
                    {eq}
                  </span>
                ))}
                {(workout.originalInput?.equipamentos?.length || 0) > 3 && (
                  <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-slate-400 border border-white/5">
                    +{(workout.originalInput?.equipamentos?.length || 0) - 3}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
