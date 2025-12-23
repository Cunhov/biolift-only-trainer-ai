import React, { useState, useEffect } from 'react';
import WizardForm from './components/WizardForm';
import ProcessingStatus from './components/ProcessingStatus';
import MarkdownView from './components/MarkdownView';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import SupportView from './components/SupportView';
import WorkoutCarousel from './components/WorkoutCarousel';
import ExportPDFButton from './components/ExportPDFButton';
import { UserInput, AgentLog, SavedWorkout, AppView } from './types';
import { auth, workouts, ai } from './services/api';

import { parseWorkoutMarkdown, WorkoutDay } from './utils/workoutParser';
import { API_URL } from './config';

const App: React.FC = () => {
  // --- STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [view, setView] = useState<AppView>('login');

  // Data
  const [savedWorkouts, setSavedWorkouts] = useState<SavedWorkout[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<SavedWorkout | null>(null);

  // View Mode for Workout (Text vs Cards)
  const [workoutViewMode, setWorkoutViewMode] = useState<'text' | 'cards'>('cards');
  const [parsedDays, setParsedDays] = useState<WorkoutDay[]>([]);

  // Processing
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Temp storage during creation
  const [tempInput, setTempInput] = useState<UserInput | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string>('');

  // Refine Modal
  const [showRefineInput, setShowRefineInput] = useState(false);
  const [refineRequest, setRefineRequest] = useState('');

  // --- EFFECTS ---

  // Auto-login on mount if token exists
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      setView('dashboard');
    }
  }, []);

  // Load from Backend on mount/auth
  useEffect(() => {
    if (isAuthenticated) {
      loadWorkouts();
    }
  }, [isAuthenticated]);

  // Parse workout when selected
  useEffect(() => {
    if (selectedWorkout) {
      const days = parseWorkoutMarkdown(selectedWorkout.content);
      setParsedDays(days);
    }
  }, [selectedWorkout]);

  const loadWorkouts = async () => {
    try {
      const response = await workouts.getAll();
      setSavedWorkouts(response.data);
    } catch (error) {
      console.error("Failed to load workouts", error);
    }
  };

  // Sync to Backend (replaced by direct API calls in handlers)
  // const persistWorkouts = ... (removed)

  // --- HANDLERS ---

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setView('dashboard');
  };

  const handleLogout = () => {
    // Clear all localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('biolift_remember_email');
    localStorage.removeItem('biolift_remember_cpf');

    // Reset all state
    setIsAuthenticated(false);
    setView('login');
    setSavedWorkouts([]);
    setSelectedWorkout(null);
    setLogs([]);
    setErrorMsg(null);
    setTempInput(null);
    setGeneratedContent('');
  };

  const handleStartCreation = async (data: UserInput) => {
    setTempInput(data);
    setView('processing');
    setLogs([]);
    setErrorMsg(null);
    setGeneratedContent('');

    try {
      // Use fetch with readable stream for better control and headers.
      const response = await fetch(`${API_URL}/ai/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')} `,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to connect to generation service');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '');
            try {
              const event = JSON.parse(dataStr);

              if (event.type === 'log') {
                setLogs(prev => [...prev, {
                  agent: event.data.agent,
                  message: event.data.message,
                  status: event.data.status
                }]);
              } else if (event.type === 'result') {
                setGeneratedContent(event.data);
                // Save workout
                const newWorkout = await workouts.create({
                  title: `Treino ${tempInput?.objetivo || 'Personalizado'} - ${new Date().toLocaleDateString()}`,
                  content: event.data,
                  originalInput: JSON.stringify(tempInput)
                });

                setSavedWorkouts(prev => [newWorkout.data, ...prev]);
                setSelectedWorkout(newWorkout.data);
                setView('view_workout');
              } else if (event.type === 'content') {
                setGeneratedContent(prev => prev + event.content);
              } else if (event.type === 'error') {
                setErrorMsg(event.message);
              }
            } catch (e) {
              console.error('Error parsing SSE', e);
            }
          }
        }
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Erro desconhecido');
    }
  };

  const addLog = (log: AgentLog) => {
    setLogs(prev => {
      const existingIdx = prev.findIndex(l => l.agent === log.agent && l.status !== 'completed' && l.status !== 'error');
      if (existingIdx !== -1) {
        const newLogs = [...prev];
        newLogs[existingIdx] = log;
        return newLogs;
      }
      return [...prev, log];
    });
  };

  const handleDeleteWorkout = async () => {
    if (!selectedWorkout) return;
    if (confirm("Tem certeza que deseja excluir este treino?")) {
      try {
        await workouts.delete(selectedWorkout.id);
        setSavedWorkouts(prev => prev.filter(w => w.id !== selectedWorkout.id));
        setSelectedWorkout(null);
        setView('dashboard');
      } catch (err) {
        alert("Erro ao excluir treino");
      }
    }
  };

  const handleRefineWorkout = async () => {
    if (!selectedWorkout || !refineRequest.trim()) return;

    setShowRefineInput(false);
    setView('processing');
    setLogs([]);
    setErrorMsg(null);
    setGeneratedContent(''); // We might want to keep old content or show diff, but for now clear.

    try {
      const response = await fetch(`${API_URL}/ai/refine`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')} `
        },
        body: JSON.stringify({
          workoutId: selectedWorkout.id,
          instructions: refineRequest
        }),
      });

      if (!response.ok || !response.body) throw new Error('Failed to refine');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const event = JSON.parse(line.replace('data: ', ''));
            if (event.type === 'content') setGeneratedContent(prev => prev + event.content);
            else if (event.type === 'done') {
              // Update local workout
              const updated = { ...selectedWorkout, content: generatedContent + event.content };
              setSelectedWorkout(updated);
              setSavedWorkouts(prev => prev.map(w => w.id === updated.id ? updated : w));
              setView('view_workout');
              setShowRefineInput(false);
              setRefineRequest('');
            }
          }
        }
      }
    } catch (e: any) {
      setErrorMsg(e.message);
      setView('view_workout'); // Go back on error
    }
  };

  // --- RENDER ---

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">

      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <main className="relative z-10 max-w-5xl mx-auto px-4 py-8 min-h-screen flex flex-col">

        {/* LOGIN VIEW */}
        {view === 'login' && (
          <div className="flex-1 flex flex-col justify-center slide-up">
            <LoginForm onLoginSuccess={handleLoginSuccess} />
          </div>
        )}

        {/* DASHBOARD VIEW */}
        {view === 'dashboard' && (
          <div className="flex-1 flex flex-col pt-8 slide-up">
            <Dashboard
              workouts={savedWorkouts}
              onCreateNew={() => setView('wizard')}
              onSelectWorkout={(w) => { setSelectedWorkout(w); setView('view_workout'); }}
              onSupport={() => { setSelectedWorkout(null); setView('support'); }}
              onLogout={handleLogout}
            />
          </div>
        )}

        {/* WIZARD VIEW */}
        {view === 'wizard' && (
          <div className="flex-1 flex flex-col justify-center slide-up">
            <div className="mb-6">
              <button
                onClick={() => setView('dashboard')}
                className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
              >
                ← Cancelar
              </button>
            </div>
            <WizardForm onSubmit={handleStartCreation} isLoading={false} />
          </div>
        )}

        {/* PROCESSING VIEW */}
        {view === 'processing' && (
          <div className="flex-1 flex flex-col justify-center items-center slide-up">
            {errorMsg ? (
              <div className="max-w-md w-full bg-red-500/10 border border-red-500/30 text-red-200 p-6 rounded-2xl backdrop-blur-md text-center">
                <h3 className="text-xl font-bold mb-2">Ops!</h3>
                <p className="mb-4">{errorMsg}</p>
                <button
                  onClick={() => setView('dashboard')}
                  className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-white font-semibold transition-colors"
                >
                  Voltar ao Início
                </button>
              </div>
            ) : (
              <ProcessingStatus logs={logs} />
            )}
          </div>
        )}

        {/* VIEW WORKOUT */}
        {view === 'view_workout' && selectedWorkout && (
          <div className="flex-1 flex flex-col pt-4 slide-up">
            {/* Header / Nav */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setView('dashboard')}
                className="text-slate-400 hover:text-white transition-colors flex items-center gap-2"
              >
                <span>←</span> Voltar
              </button>

              <div className="flex gap-2">
                <button
                  onClick={handleDeleteWorkout}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-full transition-colors"
                  title="Excluir Treino"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
                <button
                  onClick={() => setShowRefineInput(!showRefineInput)}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-full transition-colors shadow-lg shadow-blue-900/20"
                >
                  Pedir Alteração
                </button>
                <button
                  onClick={() => setView('support')}
                  className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-full transition-colors"
                >
                  Dúvidas?
                </button>
              </div>
            </div>

            {/* Refine Input Area */}
            {showRefineInput && (
              <div className="mb-8 glass-panel p-6 rounded-3xl border border-blue-500/30 animate-fade-in">
                <h3 className="text-lg font-bold text-white mb-2">O que você gostaria de mudar?</h3>
                <textarea
                  value={refineRequest}
                  onChange={(e) => setRefineRequest(e.target.value)}
                  placeholder="Ex: Não tenho barra fixa, troque por elásticos. O treino de segunda ficou muito longo..."
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24 mb-4"
                />
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowRefineInput(false)}
                    className="px-4 py-2 text-slate-400 hover:text-white font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleRefineWorkout}
                    disabled={!refineRequest.trim()}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                  >
                    Aplicar Mudanças
                  </button>
                </div>
              </div>
            )}

            {/* View Mode Toggle & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">

              {/* Toggle Switch */}
              <div className="bg-slate-800 p-1 rounded-xl flex items-center">
                <button
                  onClick={() => setWorkoutViewMode('cards')}
                  className={`px - 4 py - 2 rounded - lg text - sm font - medium transition - all ${workoutViewMode === 'cards'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                    } `}
                >
                  📱 Cards
                </button>
                <button
                  onClick={() => setWorkoutViewMode('text')}
                  className={`px - 4 py - 2 rounded - lg text - sm font - medium transition - all ${workoutViewMode === 'text'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                    } `}
                >
                  📄 Texto
                </button>
              </div>

              {selectedWorkout && (
                <ExportPDFButton
                  workoutId={selectedWorkout.id}
                  workoutTitle={selectedWorkout.title}
                />
              )}
            </div>

            {/* Content Area */}
            {workoutViewMode === 'cards' ? (
              <WorkoutCarousel days={parsedDays} />
            ) : (
              <MarkdownView content={selectedWorkout.content} />
            )}

          </div>
        )}

        {/* SUPPORT VIEW */}
        {view === 'support' && (
          <div className="flex-1 flex flex-col justify-center slide-up">
            <SupportView
              onBack={() => {
                // If we have a selected workout, go back to it, else dashboard
                if (selectedWorkout) setView('view_workout');
                else setView('dashboard');
              }}
              workoutContext={selectedWorkout || undefined}
            />
          </div>
        )}

      </main>
    </div>
  );
};

export default App;
