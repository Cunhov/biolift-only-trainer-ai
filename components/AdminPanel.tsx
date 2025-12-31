import React, { useState, useEffect } from 'react';
import { exercises } from '../services/api';

interface Exercise {
    id: string;
    nome: string;
    grupos_musculares: string[];
    equipamentos: string[];
    improvise: string[];
    youtube_url: string;
}

interface AdminPanelProps {
    onBack: () => void;
    onToggleUserMode: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack, onToggleUserMode }) => {
    const [allExercises, setAllExercises] = useState<Exercise[]>([]);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [currentExercise, setCurrentExercise] = useState<Partial<Exercise>>({});
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        loadExercises();
    }, []);

    const loadExercises = async () => {
        setIsLoading(true);
        try {
            const data = await exercises.getAll();
            setAllExercises(data as Exercise[]);
        } catch (error) {
            console.error("Failed to load exercises", error);
        } finally {
            setIsLoading(false);
        }
    };

    const safeJoin = (val: any, separator: string = ', '): string => {
        if (!val) return '';
        if (Array.isArray(val)) return val.join(separator);
        return String(val);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (currentExercise.id) {
                await exercises.update(currentExercise.id, currentExercise);
            } else {
                await exercises.add(currentExercise);
            }
            setIsEditing(false);
            setCurrentExercise({});
            loadExercises();
        } catch (error) {
            alert("Erro ao salvar exercício");
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Tem certeza que deseja excluir?")) {
            try {
                await exercises.delete(id);
                loadExercises();
            } catch (error) {
                alert("Erro ao excluir");
            }
        }
    };

    const openEdit = (ex?: Exercise) => {
        setCurrentExercise(ex || {
            nome: '',
            grupos_musculares: [],
            equipamentos: [],
            improvise: [],
            youtube_url: ''
        });
        setIsEditing(true);
    };

    return (
        <div className="flex-1 flex flex-col slide-up overflow-hidden">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        Admin Panel
                    </h1>
                    <p className="text-slate-400 text-sm">Gerencie o banco de dados de exercícios</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onToggleUserMode}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all border border-slate-700"
                    >
                        Modo Usuário
                    </button>
                    <button
                        onClick={onBack}
                        className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl transition-all border border-red-500/20"
                    >
                        Sair do Admin
                    </button>
                </div>
            </div>

            <div className="flex-1 glass-panel rounded-3xl border border-white/5 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <h2 className="font-bold text-lg text-white">Exercícios ({allExercises.length})</h2>
                    <button
                        onClick={() => openEdit()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20"
                    >
                        + Novo Exercício
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4">
                            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                            <p className="text-slate-400 animate-pulse">Carregando banco de dados...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {allExercises.map((ex) => (
                                <div key={ex.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all group">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">{ex.nome}</h3>
                                        <div className="flex gap-2">
                                            <button onClick={() => openEdit(ex)} className="text-slate-400 hover:text-white transition-colors">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                            </button>
                                            <button onClick={() => handleDelete(ex.id)} className="text-slate-400 hover:text-red-400 transition-colors">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 mb-2 truncate">
                                        {safeJoin(ex.grupos_musculares)}
                                    </p>
                                    <div className="text-xs text-blue-400 truncate">
                                        {ex.youtube_url}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {isEditing && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-slate-900 w-full max-w-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden slide-up">
                        <form onSubmit={handleSave}>
                            <div className="p-6 border-b border-white/5 bg-white/5">
                                <h3 className="text-xl font-bold text-white">
                                    {currentExercise.id ? 'Editar Exercício' : 'Novo Exercício'}
                                </h3>
                            </div>

                            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nome do Vídeo / Exercício</label>
                                    <input
                                        type="text"
                                        value={currentExercise.nome}
                                        onChange={(e) => setCurrentExercise({ ...currentExercise, nome: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="Ex: Supino Reto com Halteres"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Grupos Musculares (separados por vírgula)</label>
                                        <input
                                            type="text"
                                            value={safeJoin(currentExercise.grupos_musculares)}
                                            onChange={(e) => setCurrentExercise({ ...currentExercise, grupos_musculares: e.target.value.split(',').map(s => s.trim()) })}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                            placeholder="Peito, Tríceps"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Equipamentos (separados por vírgula)</label>
                                        <input
                                            type="text"
                                            value={safeJoin(currentExercise.equipamentos)}
                                            onChange={(e) => setCurrentExercise({ ...currentExercise, equipamentos: e.target.value.split(',').map(s => s.trim()) })}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                            placeholder="Halteres, Banco"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">YouTube URL</label>
                                    <input
                                        type="url"
                                        value={currentExercise.youtube_url}
                                        onChange={(e) => setCurrentExercise({ ...currentExercise, youtube_url: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                                        placeholder="https://www.youtube.com/watch?v=..."
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Dicas de Improviso (opcional)</label>
                                    <textarea
                                        value={safeJoin(currentExercise.improvise, '\n')}
                                        onChange={(e) => setCurrentExercise({ ...currentExercise, improvise: e.target.value.split('\n').filter(s => s.trim() !== '') })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm h-24 resize-none"
                                        placeholder="Use garrafas de água se não tiver halteres..."
                                    />
                                </div>
                            </div>

                            <div className="p-6 border-t border-white/5 flex justify-end gap-3 bg-white/5">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-6 py-2 text-slate-400 hover:text-white font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20"
                                >
                                    {currentExercise.id ? 'Salvar Alterações' : 'Criar Exercício'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
