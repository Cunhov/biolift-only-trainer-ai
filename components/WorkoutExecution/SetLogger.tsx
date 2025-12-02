import React, { useState } from 'react';

interface SetLoggerProps {
    setNumber: number;
    totalSets: number;
    targetReps: string; // ex: "8-12" ou "45s"
    onComplete: (data: { reps?: number; weight?: number; rpe?: number }) => void;
    onSkip: () => void;
}

const SetLogger: React.FC<SetLoggerProps> = ({
    setNumber,
    totalSets,
    targetReps,
    onComplete,
    onSkip,
}) => {
    const [reps, setReps] = useState<number>(10);
    const [weight, setWeight] = useState<number>(0);
    const [rpe, setRpe] = useState<number | null>(null);

    const handleComplete = () => {
        onComplete({
            reps,
            weight: weight > 0 ? weight : undefined,
            rpe: rpe || undefined,
        });
    };

    return (
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
            <div className="text-center mb-6">
                <div className="text-sm text-slate-400 mb-1">Série {setNumber} de {totalSets}</div>
                <div className="text-lg text-blue-400 font-semibold">Repetições: {targetReps}</div>
            </div>

            {/* Reps Counter */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                    Quantas repetições você fez?
                </label>
                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={() => setReps(Math.max(0, reps - 1))}
                        className="w-12 h-12 bg-slate-700 hover:bg-slate-600 rounded-xl text-white text-2xl font-bold transition-colors"
                    >
                        −
                    </button>
                    <input
                        type="number"
                        value={reps}
                        onChange={(e) => setReps(parseInt(e.target.value) || 0)}
                        className="w-24 h-12 bg-slate-900 border border-slate-600 rounded-xl text-center text-2xl font-bold text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button
                        onClick={() => setReps(reps + 1)}
                        className="w-12 h-12 bg-slate-700 hover:bg-slate-600 rounded-xl text-white text-2xl font-bold transition-colors"
                    >
                        +
                    </button>
                </div>
            </div>

            {/* Weight Input */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                    Peso usado (kg) - Opcional
                </label>
                <input
                    type="number"
                    step="0.5"
                    value={weight}
                    onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>

            {/* RPE (Rate of Perceived Exertion) */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                    Quão difícil foi? (1-10) - Opcional
                </label>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                        <button
                            key={value}
                            onClick={() => setRpe(rpe === value ? null : value)}
                            className={`flex-1 h-10 rounded-lg font-medium transition-all ${rpe === value
                                ? 'bg-blue-600 text-white scale-110'
                                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                }`}
                        >
                            {value}
                        </button>
                    ))}
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>Fácil</span>
                    <span>Máximo</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
                <button
                    onClick={onSkip}
                    className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
                >
                    Pular
                </button>
                <button
                    onClick={handleComplete}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold transition-all shadow-lg"
                >
                    ✓ Concluir Série
                </button>
            </div>
        </div>
    );
};

export default SetLogger;
