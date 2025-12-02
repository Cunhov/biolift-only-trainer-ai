import React from 'react';

interface CompletionSummaryProps {
    summary: {
        summary: {
            duration: number;
            exercisesCompleted: number;
            totalSets: number;
        };
        suggestions: Array<{
            exercise: string;
            sets: Array<{ setNumber: number; reps: number }>;
            status: 'progress' | 'maintain' | 'regress';
            suggestion: string;
        }>;
    };
    onExit: () => void;
}

const CompletionSummary: React.FC<CompletionSummaryProps> = ({ summary, onExit }) => {
    const { duration, exercisesCompleted, totalSets } = summary.summary;

    const getStatusEmoji = (status: string) => {
        switch (status) {
            case 'progress': return '🟢';
            case 'maintain': return '🟡';
            case 'regress': return '🔴';
            default: return '⚪';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'progress': return 'text-green-400';
            case 'maintain': return 'text-yellow-400';
            case 'regress': return 'text-red-400';
            default: return 'text-slate-400';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-4 flex items-center justify-center">
            <div className="max-w-2xl w-full">
                {/* Success Header */}
                <div className="text-center mb-8 animate-fade-in">
                    <div className="text-8xl mb-4">🎉</div>
                    <h1 className="text-4xl font-bold text-white mb-2">Treino Completo!</h1>
                    <p className="text-slate-400">Parabéns por mais uma sessão concluída</p>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-slate-800/50 rounded-2xl p-6 text-center border border-slate-700">
                        <div className="text-3xl font-bold text-blue-400 mb-1">
                            {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
                        </div>
                        <div className="text-sm text-slate-400">Duração</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-2xl p-6 text-center border border-slate-700">
                        <div className="text-3xl font-bold text-purple-400 mb-1">{exercisesCompleted}</div>
                        <div className="text-sm text-slate-400">Exercícios</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-2xl p-6 text-center border border-slate-700">
                        <div className="text-3xl font-bold text-green-400 mb-1">{totalSets}</div>
                        <div className="text-sm text-slate-400">Séries</div>
                    </div>
                </div>

                {/* Progression Analysis */}
                <div className="bg-slate-800/50 rounded-3xl p-6 mb-6 border border-slate-700">
                    <h2 className="text-xl font-bold text-white mb-4">📈 Análise de Progressão</h2>

                    <div className="space-y-4">
                        {summary.suggestions.map((item, idx) => (
                            <div key={idx} className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                                <div className="flex items-start gap-3 mb-2">
                                    <span className="text-2xl">{getStatusEmoji(item.status)}</span>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-white mb-1">{item.exercise}</h3>
                                        <div className="flex gap-2 mb-2">
                                            {item.sets.map((set, i) => (
                                                <span key={i} className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300">
                                                    S{set.setNumber}: {set.reps} reps
                                                </span>
                                            ))}
                                        </div>
                                        <p className={`text-sm ${getStatusColor(item.status)}`}>
                                            💡 {item.suggestion}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Summary */}
                <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-2xl p-6 mb-6 border border-blue-500/30">
                    <h3 className="font-semibold text-white mb-2">🎯 Resumo Geral</h3>
                    <div className="text-sm text-slate-300 space-y-1">
                        <p>• {summary.suggestions.filter(s => s.status === 'progress').length} exercícios com progressão possível</p>
                        <p>• {summary.suggestions.filter(s => s.status === 'maintain').length} exercícios para manter</p>
                        <p>• {summary.suggestions.filter(s => s.status === 'regress').length} exercícios para regredir</p>
                    </div>
                    <p className="text-white font-medium mt-3">Continue assim! 💪</p>
                </div>

                {/* Action Button */}
                <button
                    onClick={onExit}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-lg text-lg"
                >
                    Voltar ao Dashboard
                </button>
            </div>
        </div>
    );
};

export default CompletionSummary;
