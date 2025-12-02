import React from 'react';
import YouTubeEmbed from './YouTubeEmbed';

interface ExerciseCardProps {
    number: number;
    name: string;
    muscles: string;
    sets: number;
    reps: string;
    rest: number;
    tempo?: string;
    notes?: string;
    improvise?: string[];
    videoUrl?: string;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
    number,
    name,
    muscles,
    sets,
    reps,
    rest,
    tempo,
    notes,
    improvise,
    videoUrl,
}) => {
    return (
        <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700 hover:border-blue-500/30 transition-all">
            {/* Exercise Header */}
            <div className="mb-4">
                <h3 className="text-2xl font-bold text-white mb-2">
                    💪 EXERCÍCIO {number}: {name}
                </h3>
                <p className="text-slate-300">
                    <span className="font-medium">🎯 Músculos Trabalhados:</span> {muscles}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-slate-900/50 rounded-xl p-3 text-center">
                    <div className="text-xs text-slate-400 mb-1 break-words">SÉRIES</div>
                    <div className="text-2xl font-bold text-white">{sets}</div>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-3 text-center">
                    <div className="text-xs text-slate-400 mb-1 break-words">REPETIÇÕES</div>
                    <div className="text-lg font-bold text-blue-400 break-words leading-tight">{reps}</div>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-3 text-center">
                    <div className="text-xs text-slate-400 mb-1 break-words">DESCANSO</div>
                    <div className="text-2xl font-bold text-purple-400">{rest}s</div>
                </div>
            </div>

            {tempo && (
                <div className="mb-4 p-3 bg-blue-900/20 rounded-xl border border-blue-500/30">
                    <span className="text-sm text-blue-300">
                        <strong>⏱️ Tempo de Execução:</strong> {tempo}
                    </span>
                </div>
            )}

            {/* Notes */}
            {notes && (
                <div className="mb-4">
                    <h4 className="text-sm font-semibold text-slate-300 mb-2">📝 Técnica & Observações:</h4>
                    <div className="text-sm text-slate-400 space-y-1">
                        {notes.split('\n').map((line, idx) => (
                            <p key={idx}>• {line}</p>
                        ))}
                    </div>
                </div>
            )}

            {/* Improvise */}
            {improvise && improvise.length > 0 && (
                <div className="mb-4">
                    <h4 className="text-sm font-semibold text-slate-300 mb-2">🏠 Improvise (sem equipamento):</h4>
                    <div className="text-sm text-slate-400 space-y-1">
                        {improvise.map((alt, idx) => (
                            <p key={idx}>• {alt}</p>
                        ))}
                    </div>
                </div>
            )}

            {/* Video */}
            {videoUrl && (
                <div className="mt-4">
                    <h4 className="text-sm font-semibold text-slate-300 mb-2">🎥 Vídeo Demonstrativo:</h4>
                    <YouTubeEmbed url={videoUrl} title={name} />
                </div>
            )}
        </div>
    );
};

export default ExerciseCard;
