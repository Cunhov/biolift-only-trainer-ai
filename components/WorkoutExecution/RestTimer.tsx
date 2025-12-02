import React, { useState, useEffect } from 'react';

interface RestTimerProps {
    duration: number; // em segundos
    onComplete: () => void;
    onSkip: () => void;
    soundEnabled: boolean;
}

const RestTimer: React.FC<RestTimerProps> = ({ duration, onComplete, onSkip, soundEnabled }) => {
    const [timeLeft, setTimeLeft] = useState(duration);
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        if (!isActive || timeLeft <= 0) return;

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    if (soundEnabled) {
                        playSound('rest-complete');
                    }
                    setTimeout(onComplete, 500);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isActive, timeLeft, onComplete, soundEnabled]);

    const progress = ((duration - timeLeft) / duration) * 100;

    return (
        <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-3xl border border-blue-500/30">
            <div className="text-slate-400 text-sm font-medium mb-2">Descansando...</div>

            {/* Timer Display */}
            <div className="text-8xl font-bold text-white mb-6 tabular-nums">
                {formatTime(timeLeft)}
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-md h-3 bg-slate-800 rounded-full overflow-hidden mb-6">
                <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000 ease-linear"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Skip Button */}
            <button
                onClick={onSkip}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
            >
                Pular Descanso →
            </button>
        </div>
    );
};

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function playSound(type: 'rest-complete' | 'workout-complete' | 'beep') {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (type === 'rest-complete') {
        oscillator.frequency.value = 800;
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } else if (type === 'workout-complete') {
        // Success sound - two beeps
        oscillator.frequency.value = 600;
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.15);

        setTimeout(() => {
            const osc2 = audioContext.createOscillator();
            const gain2 = audioContext.createGain();
            osc2.connect(gain2);
            gain2.connect(audioContext.destination);
            osc2.frequency.value = 800;
            gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
            osc2.start(audioContext.currentTime);
            osc2.stop(audioContext.currentTime + 0.2);
        }, 200);
    }
}

export default RestTimer;
