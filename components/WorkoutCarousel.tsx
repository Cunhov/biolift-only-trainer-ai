import React, { useState, useRef } from 'react';
import { WorkoutDay } from '../utils/workoutParser';
import YouTubeEmbed from './YouTubeEmbed';

interface WorkoutCarouselProps {
    days: WorkoutDay[];
}

const WorkoutCarousel: React.FC<WorkoutCarouselProps> = ({ days }) => {
    const [currentDayIndex, setCurrentDayIndex] = useState(0);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Touch handling
    const touchStartX = useRef<number>(0);
    const touchStartY = useRef<number>(0);

    const currentDay = days[currentDayIndex];
    const currentExercise = currentDay?.exercises[currentExerciseIndex];

    if (!currentDay || !currentExercise) {
        return <div className="text-white text-center p-8">Nenhum exercício encontrado.</div>;
    }

    const handleNextExercise = () => {
        if (isTransitioning) return;
        if (currentExerciseIndex < currentDay.exercises.length - 1) {
            setIsTransitioning(true);
            setCurrentExerciseIndex(currentExerciseIndex + 1);
            setTimeout(() => setIsTransitioning(false), 300);
        }
    };

    const handlePrevExercise = () => {
        if (isTransitioning) return;
        if (currentExerciseIndex > 0) {
            setIsTransitioning(true);
            setCurrentExerciseIndex(currentExerciseIndex - 1);
            setTimeout(() => setIsTransitioning(false), 300);
        }
    };

    const handleNextDay = () => {
        if (isTransitioning) return;
        if (currentDayIndex < days.length - 1) {
            setIsTransitioning(true);
            setCurrentDayIndex(currentDayIndex + 1);
            setCurrentExerciseIndex(0);
            setTimeout(() => setIsTransitioning(false), 300);
        }
    };

    const handlePrevDay = () => {
        if (isTransitioning) return;
        if (currentDayIndex > 0) {
            setIsTransitioning(true);
            setCurrentDayIndex(currentDayIndex - 1);
            setCurrentExerciseIndex(0);
            setTimeout(() => setIsTransitioning(false), 300);
        }
    };

    // Touch handlers for swipe
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const deltaX = touchStartX.current - touchEndX;
        const deltaY = touchStartY.current - touchEndY;

        // Determine if it's a horizontal or vertical swipe
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe
            if (Math.abs(deltaX) > 50) {
                if (deltaX > 0) {
                    handleNextExercise();
                } else {
                    handlePrevExercise();
                }
            }
        } else {
            // Vertical swipe
            if (Math.abs(deltaY) > 50) {
                if (deltaY > 0) {
                    handleNextDay();
                } else {
                    handlePrevDay();
                }
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[85vh] w-full max-w-md mx-auto relative px-4 py-8">

            {/* Day Navigation (Up) */}
            <button
                onClick={handlePrevDay}
                disabled={currentDayIndex === 0}
                className={`mb-6 px-6 py-3 rounded-2xl font-medium text-sm transition-all duration-300 backdrop-blur-sm ${currentDayIndex === 0
                    ? 'bg-slate-800/30 text-slate-600 cursor-not-allowed'
                    : 'bg-gradient-to-b from-slate-800/60 to-slate-800/40 text-white hover:from-slate-700/60 hover:to-slate-700/40 border border-slate-700/50 shadow-lg hover:shadow-xl active:scale-95'
                    }`}
            >
                <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    <span>Dia Anterior</span>
                </div>
            </button>

            {/* Main Card */}
            <div
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className={`w-full bg-gradient-to-br from-slate-900/95 to-slate-800/95 rounded-[32px] p-8 shadow-2xl border border-slate-700/50 backdrop-blur-xl relative overflow-hidden min-h-[600px] flex flex-col transition-all duration-300 ${isTransitioning ? 'opacity-50 scale-98' : 'opacity-100 scale-100'
                    }`}
                style={{
                    boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                }}
            >

                {/* Subtle background gradient accent */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5 pointer-events-none" />

                {/* Day Title Badge */}
                <div className="absolute top-5 left-0 right-0 flex justify-center z-10">
                    <span className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl text-blue-300 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider border border-blue-500/20 shadow-lg">
                        {currentDay.title}
                    </span>
                </div>

                {/* Exercise Header */}
                <div className="mt-12 text-center mb-8 relative z-10">
                    <div className="text-blue-400/80 text-xs font-semibold tracking-widest mb-2 uppercase">
                        Exercício {currentExerciseIndex + 1} de {currentDay.exercises.length}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight transition-all duration-300">
                        {currentExercise.name}
                    </h2>
                    <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
                        <span className="inline-flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
                            <span className="text-xs">🎯</span>
                            <span>{currentExercise.muscles}</span>
                        </span>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mb-8 relative z-10">
                    <div className="bg-gradient-to-br from-slate-800/60 to-slate-800/40 rounded-2xl p-4 text-center border border-slate-700/40 backdrop-blur-sm transition-all duration-300 hover:border-slate-600/50">
                        <div className="text-3xl font-bold text-white mb-1">{currentExercise.sets}</div>
                        <div className="text-xs text-slate-400 font-medium uppercase tracking-wide">Séries</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 rounded-2xl p-4 text-center border border-blue-700/30 backdrop-blur-sm transition-all duration-300 hover:border-blue-600/40">
                        <div className="text-3xl font-bold text-blue-400 mb-1">{currentExercise.reps}</div>
                        <div className="text-xs text-slate-400 font-medium uppercase tracking-wide">Repetições</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 rounded-2xl p-4 text-center border border-purple-700/30 backdrop-blur-sm transition-all duration-300 hover:border-purple-600/40">
                        <div className="text-3xl font-bold text-purple-400 mb-1">{currentExercise.rest}s</div>
                        <div className="text-xs text-slate-400 font-medium uppercase tracking-wide">Descanso</div>
                    </div>
                </div>

                {/* Notes / Improvise */}
                <div className="bg-gradient-to-br from-slate-800/40 to-slate-800/20 rounded-2xl p-5 border border-slate-700/40 backdrop-blur-sm mb-6 flex-1 relative z-10 overflow-auto max-h-48">
                    {currentExercise.notes ? (
                        <div className="text-sm text-slate-300 leading-relaxed">
                            <span className="inline-block mr-2">💡</span>
                            {currentExercise.notes}
                        </div>
                    ) : (
                        <div className="text-sm text-slate-500 italic text-center mt-4">Sem observações adicionais</div>
                    )}

                    {currentExercise.improvise && currentExercise.improvise.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-700/40">
                            <div className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-wide">🏠 Improvise</div>
                            <div className="space-y-1">
                                {currentExercise.improvise.map((imp, idx) => (
                                    <div key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                                        <span className="text-slate-600 mt-0.5">•</span>
                                        <span>{imp}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Video Embed */}
                {currentExercise.videoUrl && (
                    <div className="mb-4 relative z-10">
                        <YouTubeEmbed url={currentExercise.videoUrl} title={currentExercise.name} />
                    </div>
                )}

                {/* Navigation Indicators */}
                <div className="flex justify-between items-center mt-auto pt-6 relative z-10">
                    <button
                        onClick={handlePrevExercise}
                        disabled={currentExerciseIndex === 0}
                        className={`p-3 rounded-xl transition-all duration-300 ${currentExerciseIndex === 0
                            ? 'text-slate-700 cursor-not-allowed'
                            : 'text-white bg-slate-800/40 hover:bg-slate-700/60 border border-slate-700/40 hover:border-slate-600/60 active:scale-95'
                            }`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <div className="flex items-center gap-2">
                        {currentDay.exercises.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentExerciseIndex
                                    ? 'w-8 bg-blue-500'
                                    : 'w-1.5 bg-slate-700'
                                    }`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={handleNextExercise}
                        disabled={currentExerciseIndex === currentDay.exercises.length - 1}
                        className={`p-3 rounded-xl transition-all duration-300 ${currentExerciseIndex === currentDay.exercises.length - 1
                            ? 'text-slate-700 cursor-not-allowed'
                            : 'text-white bg-slate-800/40 hover:bg-slate-700/60 border border-slate-700/40 hover:border-slate-600/60 active:scale-95'
                            }`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {/* Swipe hint */}
                <div className="absolute bottom-3 left-0 right-0 text-center text-xs text-slate-600 pointer-events-none">
                    Arraste para navegar
                </div>

            </div>

            {/* Day Navigation (Down) */}
            <button
                onClick={handleNextDay}
                disabled={currentDayIndex === days.length - 1}
                className={`mt-6 px-6 py-3 rounded-2xl font-medium text-sm transition-all duration-300 backdrop-blur-sm ${currentDayIndex === days.length - 1
                    ? 'bg-slate-800/30 text-slate-600 cursor-not-allowed'
                    : 'bg-gradient-to-b from-slate-800/60 to-slate-800/40 text-white hover:from-slate-700/60 hover:to-slate-700/40 border border-slate-700/50 shadow-lg hover:shadow-xl active:scale-95'
                    }`}
            >
                <div className="flex items-center gap-2">
                    <span>Próximo Dia</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            {/* Day indicator dots */}
            {days.length > 1 && (
                <div className="mt-4 flex items-center gap-2">
                    {days.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-2 w-2 rounded-full transition-all duration-300 ${idx === currentDayIndex
                                ? 'bg-blue-500 scale-125'
                                : 'bg-slate-700'
                                }`}
                        />
                    ))}
                </div>
            )}

        </div>
    );
};

export default WorkoutCarousel;
