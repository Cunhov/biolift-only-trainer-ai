import React, { useState, useEffect } from 'react';
import { auth } from '../services/api';

interface LoginFormProps {
  onLoginSuccess: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
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
      .replace(/\D/g, '') // Remove tudo o que não é dígito
      .replace(/(\d{3})(\d)/, '$1.$2') // Coloca um ponto entre o terceiro e o quarto dígitos
      .replace(/(\d{3})(\d)/, '$1.$2') // Coloca um ponto entre o terceiro e o quarto dígitos de novo
      .replace(/(\d{3})(\d{1,2})/, '$1-$2') // Coloca um hífen entre o terceiro e o quarto dígitos
      .replace(/(-\d{2})\d+?$/, '$1'); // Impede que sejam digitados mais de 11 dígitos
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCPF(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await auth.login({
        email: email,
        password: cpf
      });

      localStorage.setItem('token', response.data.token);

      // Save credentials if Remember Me is checked
      if (rememberMe) {
        localStorage.setItem('biolift_remember_email', email);
        localStorage.setItem('biolift_remember_cpf', cpf);
      } else {
        // Clear saved credentials if unchecked
        localStorage.removeItem('biolift_remember_email');
        localStorage.removeItem('biolift_remember_cpf');
      }

      onLoginSuccess();

    } catch (err: any) {
      console.error("Login Error:", err);
      setError(err.response?.data?.error || 'Falha no login. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto glass-panel rounded-[2rem] p-8 md:p-10 shadow-2xl animate-fade-in relative overflow-hidden">

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Bem-vindo</h2>
        <p className="text-slate-400">BioLift Trainer AI</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Email Input */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-semibold text-slate-300 ml-1">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="w-full bg-[#1c1c1e] border border-[#2c2c2e] rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
          />
        </div>

        {/* CPF Input */}
        <div className="space-y-2">
          <label htmlFor="cpf" className="text-sm font-semibold text-slate-300 ml-1">
            CPF
          </label>
          <input
            id="cpf"
            type="text"
            required
            value={cpf}
            onChange={handleCpfChange}
            placeholder="000.000.000-00"
            maxLength={14}
            className="w-full bg-[#1c1c1e] border border-[#2c2c2e] rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
          />
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center">
          <input
            id="remember"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-[#2c2c2e] bg-[#1c1c1e] text-blue-600 focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
          />
          <label htmlFor="remember" className="ml-2 text-sm text-slate-300 cursor-pointer select-none">
            Lembrar credenciais
          </label>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm text-center animate-pulse">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all active:scale-[0.98] ${isLoading
            ? 'bg-slate-700 text-slate-400 cursor-wait'
            : 'bg-white text-black hover:bg-gray-100 hover:shadow-white/10'
            }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Verificando...
            </span>
          ) : (
            'Acessar App'
          )}
        </button>
      </form>

      <p className="text-center text-xs text-slate-600 mt-6">
        Acesso exclusivo para membros registrados.
      </p>
    </div>
  );
};

export default LoginForm;