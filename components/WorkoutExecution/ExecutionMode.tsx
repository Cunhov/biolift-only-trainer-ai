import React, { useState, useEffect } from 'react';
import RestTimer from './RestTimer';
import SetLogger from './SetLogger';
import CompletionSummary from './CompletionSummary';
import axios from 'axios';
import { API_URL } from '../../config';

interface Exercise {
    name: string;
    muscles: string;
    sets: number;
    reps: string;
    rest: number;
    notes?: string;
}

interface ExecutionModeProps {
    workoutId: string;
    exercises: Exercise[];
    onExit: () => void;
}

type ExecutionState = 'executing' | 'resting' | 'logging' | 'completed';

const ExecutionMode: React.FC<ExecutionModeProps> = ({ workoutId, exercises, onExit }) => {
    const [logId, setLogId] = useState<string | null>(null);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [currentSet, setCurrentSet] = useState(1);
    const [state, setState] = useState<ExecutionState>('logging');
    const [startTime] = useState(Date.now());
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [completedSets, setCompletedSets] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>(null);

    const currentExercise = exercises[currentExerciseIndex];
    const totalExercises = exercises.length;
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);

    // Start workout log
    useEffect(() => {
        startWorkoutLog();
    }, []);

    const startWorkoutLog = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_URL}/workout-logs/workouts/${workoutId}/start`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setLogId(response.data.logId);
        } catch (error) {
            console.error('Failed to start workout log:', error);
        }
    };

    const handleSetComplete = async (data: { reps?: number; weight?: number; rpe?: number }) => {
        if (!logId) return;

        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${API_URL}/workout-logs/logs/${logId}/exercises/${currentExercise.name}/sets`,
                {
                    setNumber: currentSet,
                    ...data,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setCompletedSets([...completedSets, { exercise: currentExercise.name, set: currentSet, ...data }]);

            // Move to next set or exercise
            if (currentSet < currentExercise.sets) {
                setCurrentSet(currentSet + 1);
                setState('resting');
            } else {
                // Move to next exercise
                if (currentExerciseIndex < totalExercises - 1) {
                    setCurrentExerciseIndex(currentExerciseIndex + 1);
                    setCurrentSet(1);
                    setState('logging');
                } else {
                    // Workout complete!
                    completeWorkout();
                }
            }
        } catch (error) {
            console.error('Failed to log set:', error);
        }
    };

    const handleSkipExercise = async () => {
        if (!logId) return;

        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${API_URL}/workout-logs/logs/${logId}/exercises/${currentExercise.name}/skip`,
                { notes: 'Pulado pelo usuário' },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (currentExerciseIndex < totalExercises - 1) {
                setCurrentExerciseIndex(currentExerciseIndex + 1);
                setCurrentSet(1);
                setState('logging');
            } else {
                completeWorkout();
            }
        } catch (error) {
            console.error('Failed to skip exercise:', error);
        }
    };

    const completeWorkout = async () => {
        if (!logId) return;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_URL}/workout-logs/logs/${logId}/complete`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSummary(response.data);
            setState('completed');

            if (soundEnabled) {
                playWorkoutCompleteSound();
            }
        } catch (error) {
            console.error('Failed to complete workout:', error);
        }
    };

    const handleRestComplete = () => {
        setState('logging');
    };

    const handleSkipRest = () => {
        setState('logging');
    };

    if (state === 'completed' && summary) {
        return <CompletionSummary summary={summary} onExit={onExit} />;
    }

    const progress = ((currentExerciseIndex * currentExercise.sets + currentSet - 1) /
        (exercises.reduce((sum, ex) => sum + ex.sets, 0))) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 p-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={onExit}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors"
                    >
                        ← Sair
                    </button>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            className={`px-4 py-2 rounded-xl transition-colors ${soundEnabled ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                                }`}
                        >
                            {soundEnabled ? '🔊' : '🔇'}
                        </button>
                    </div>
                </div>

                {/* Progress Overview */}
                <div className="bg-slate-800/50 rounded-2xl p-6 mb-6 border border-slate-700">
                    <div className="flex justify-between text-sm text-slate-400 mb-2">
                        <span>Progresso do Treino</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden mb-4">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-white font-medium">
                            Exercício {currentExerciseIndex + 1} de {totalExercises}
                        </span>
                        <span className="text-slate-400">
                            ⏱️ {formatTime(elapsedTime)}
                        </span>
                    </div>
                </div>

                {/* Current Exercise Info */}
                <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-3xl p-8 mb-6 border border-blue-500/30">
                    <div className="text-center mb-6">
                        <div className="text-sm text-blue-400 font-medium mb-2">EXERCÍCIO ATUAL</div>
                        <h2 className="text-3xl font-bold text-white mb-2">{currentExercise.name}</h2>
                        <div className="text-slate-300">🎯 {currentExercise.muscles}</div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-slate-800/50 rounded-xl p-4">
                            <div className="text-2xl font-bold text-white">{currentSet}</div>
                            <div className="text-xs text-slate-400">Séries</div>
                        </div>
                        <div className="bg-slate-800/50 rounded-xl p-4">
                            <div className="text-2xl font-bold text-blue-400">{currentExercise.reps}</div>
                            <div className="text-xs text-slate-400">Repetições</div>
                        </div>
                        <div className="bg-slate-800/50 rounded-xl p-4">
                            <div className="text-2xl font-bold text-purple-400">{currentExercise.rest}s</div>
                            <div className="text-xs text-slate-400">Descanso</div>
                        </div>
                    </div>

                    {currentExercise.notes && (
                        <div className="mt-4 p-4 bg-slate-800/50 rounded-xl text-sm text-slate-300">
                            💡 {currentExercise.notes}
                        </div>
                    )}
                </div>

                {/* State-based Content */}
                {state === 'resting' && (
                    <RestTimer
                        duration={currentExercise.rest}
                        onComplete={handleRestComplete}
                        onSkip={handleSkipRest}
                        soundEnabled={soundEnabled}
                    />
                )}

                {state === 'logging' && (
                    <SetLogger
                        setNumber={currentSet}
                        totalSets={currentExercise.sets}
                        targetReps={currentExercise.reps}
                        onComplete={handleSetComplete}
                        onSkip={handleSkipExercise}
                    />
                )}

                {/* Session History */}
                {completedSets.length > 0 && (
                    <div className="mt-6 bg-slate-800/30 rounded-2xl p-4 border border-slate-700">
                        <div className="text-sm font-medium text-slate-400 mb-3">📝 Histórico desta Sessão</div>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {completedSets.slice(-5).reverse().map((set, idx) => (
                                <div key={idx} className="flex justify-between text-sm bg-slate-800/50 rounded-lg p-2">
                                    <span className="text-slate-300">{set.exercise} - Série {set.set}</span>
                                    <span className="text-blue-400 font-medium">
                                        {set.reps} reps {set.weight ? `• ${set.weight}kg` : ''}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function playWorkoutCompleteSound() {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Play success melody
    const notes = [523, 659, 784]; // C, E, G
    notes.forEach((freq, i) => {
        setTimeout(() => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.3, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            osc.start(audioContext.currentTime);
            osc.stop(audioContext.currentTime + 0.3);
        }, i * 150);
    });
}

export default ExecutionMode;
