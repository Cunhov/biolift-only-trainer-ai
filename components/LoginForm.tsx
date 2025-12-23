import React, { useState, useEffect } from 'react';
import { auth } from '../services/api';

interface LoginFormProps {
  onLoginSuccess: (isAdmin: boolean) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved credentials on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('biolift_remember_email');
    const savedCpf = localStorage.getItem('biolift_remember_cpf');

    if (savedEmail && savedCpf) {
      setEmail(savedEmail);
      setCpf(savedCpf);
      setRememberMe(true);
    }
  }, []);

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCPF(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isAdminMode) {
        const response = await auth.adminLogin(email, adminPassword);
        onLoginSuccess(true);
      } else {
        const response = await auth.login(email, cpf);

        // Save credentials if Remember Me is checked
        if (rememberMe) {
          localStorage.setItem('biolift_remember_email', email);
          localStorage.setItem('biolift_remember_cpf', cpf);
        } else {
          localStorage.removeItem('biolift_remember_email');
          localStorage.removeItem('biolift_remember_cpf');
        }

        onLoginSuccess(false);
      }

    } catch (err: any) {
      console.error("Login Error:", err);
      setError(err.message || 'Falha no login. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto glass-panel rounded-[2rem] p-8 md:p-10 shadow-2xl animate-fade-in relative overflow-hidden flex flex-col min-h-[500px]">

      {/* Admin Mode Toggle */}
      <button
        onClick={() => { setIsAdminMode(!isAdminMode); setError(null); }}
        className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 transition-colors group"
        title={isAdminMode ? "Acesso Usuário" : "Acesso Admin"}
      >
        <svg
          className={`w-5 h-5 transition-colors ${isAdminMode ? 'text-blue-400' : 'text-slate-600 group-hover:text-slate-400'}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </button>

      <div className="text-center mb-10">
        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
          {isAdminMode ? 'System Admin' : 'Bem-vindo'}
        </h2>
        <p className="text-slate-500 font-medium tracking-wide uppercase text-[10px]">
          {isAdminMode ? 'Painel de Controle Privado' : 'BioLift Trainer AI'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">

        {/* Email Input */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-blue-600/50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-700"
          />
        </div>

        {/* Conditional Input: CPF or Password */}
        {!isAdminMode ? (
          <div className="space-y-2 animate-fade-in">
            <label htmlFor="cpf" className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
              CPF (Apenas números)
            </label>
            <input
              id="cpf"
              type="text"
              required
              value={cpf}
              onChange={handleCpfChange}
              placeholder="000.000.000-00"
              maxLength={14}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-blue-600/50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-700"
            />
          </div>
        ) : (
          <div className="space-y-2 animate-fade-in">
            <label htmlFor="pass" className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
              Senha Administrativa
            </label>
            <input
              id="pass"
              type="password"
              required
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-blue-600/50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-700"
            />
          </div>
        )}

        {/* Remember Me Checkbox (Only for normal users) */}
        {!isAdminMode && (
          <div className="flex items-center ml-1">
            <input
              id="remember"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-blue-600 focus:ring-2 focus:ring-blue-600/50 cursor-pointer"
            />
            <label htmlFor="remember" className="ml-3 text-sm font-medium text-slate-400 cursor-pointer select-none">
              Salvar meu login
            </label>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs text-center font-bold animate-pulse">
            {error}
          </div>
        )}

        <div className="mt-auto">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all active:scale-[0.98] ${isLoading
              ? 'bg-slate-800 text-slate-600 cursor-wait'
              : isAdminMode
                ? 'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-blue-600/20'
                : 'bg-white text-black hover:bg-slate-200 shadow-white/5'
              }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verificando...
              </span>
            ) : (
              isAdminMode ? 'Entrar como Admin' : 'Acessar Treinador'
            )}
          </button>
        </div>
      </form>

      {!isAdminMode && (
        <p className="text-center text-[10px] font-bold text-slate-600 mt-8 tracking-widest uppercase">
          Acesso Restrito a Alunos Biolift
        </p>
      )}
    </div>
  );
};

export default LoginForm;