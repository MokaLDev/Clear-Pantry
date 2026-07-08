import React, { useState } from 'react';
import { User as UserIcon, Lock, ArrowRight, Utensils } from 'lucide-react';
import { User } from '../types';
import { useI18n } from '../i18n';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { t } = useI18n();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = username.trim();
    if (!trimmedName || !password) {
      setError(t('login.errors.missingFields'));
      return;
    }

    setLoading(true);
    try {
      const endpoint = isSignUp ? '/api/signup' : '/api/login';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmedName, password })
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || t('login.errors.generic'));
        return;
      }

      onLogin(result.user as User);
    } catch {
      setError(t('login.errors.serverUnreachable'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-full bg-[#fcf9f8] text-[#1c1b1b] flex flex-col justify-center items-center p-6 overflow-y-auto font-sans">
      {/* Ambient top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[#006970]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm">
        {/* Brand mark */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-full border border-[#e5e2e1] bg-white flex items-center justify-center shadow-sm mb-4">
            <Utensils size={24} className="text-[#006970]" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#1c1b1b]">{t('login.brand')}</h1>
          <p className="text-xs text-[#6a7a7b] mt-1">{t('login.subtitle')}</p>
        </div>

        {/* Auth card */}
        <div className="bg-white border border-[#e5e2e1] rounded-lg shadow-sm p-6">
          {/* Mode toggle */}
          <div className="flex rounded-md bg-[#f3f0ef] p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setError(null);
              }}
              className={`flex-1 py-2 text-[11px] font-mono font-bold tracking-wider rounded transition-colors ${
                !isSignUp ? 'bg-white text-[#006970] shadow-sm' : 'text-[#6a7a7b] hover:text-[#1c1b1b]'
              }`}
            >
              {t('login.logIn')}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setError(null);
              }}
              className={`flex-1 py-2 text-[11px] font-mono font-bold tracking-wider rounded transition-colors ${
                isSignUp ? 'bg-white text-[#006970] shadow-sm' : 'text-[#6a7a7b] hover:text-[#1c1b1b]'
              }`}
            >
              {t('login.signUp')}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#6a7a7b] mb-1.5">
                {t('login.username')}
              </label>
              <div className="relative">
                <UserIcon
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6a7a7b]"
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t('login.usernamePlaceholder')}
                  className="w-full bg-[#fcf9f8] border border-[#e5e2e1] rounded pl-9 pr-3 py-2.5 text-sm text-[#1c1b1b] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#006970] focus:ring-1 focus:ring-[#006970] transition-all"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#6a7a7b] mb-1.5">
                {t('login.password')}
              </label>
              <div className="relative">
                <Lock
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6a7a7b]"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('login.passwordPlaceholder')}
                  className="w-full bg-[#fcf9f8] border border-[#e5e2e1] rounded pl-9 pr-3 py-2.5 text-sm text-[#1c1b1b] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#006970] focus:ring-1 focus:ring-[#006970] transition-all"
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                />
              </div>
            </div>

            {error && (
              <div className="bg-[#ffdad6]/30 border border-[#ba1a1a]/20 rounded p-2.5 text-[11px] text-[#ba1a1a] font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#1c1b1b] text-white hover:bg-black active:scale-[0.98] transition-all font-mono text-xs font-bold tracking-[0.15em] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? t('login.submit.processing') : isSignUp ? t('login.submit.createAccount') : t('login.submit.enterKitchen')}
              {!loading && <ArrowRight size={14} />}
            </button>
          </form>

          <p className="text-[10px] text-center text-[#6a7a7b] mt-4">
            {isSignUp ? t('login.footer.alreadyHaveAccount') : t('login.footer.newHere')}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-[#006970] font-semibold hover:underline"
            >
              {isSignUp ? t('login.footer.logInLink') : t('login.footer.signUpLink')}
            </button>
          </p>
        </div>

        <p className="text-[9px] text-center text-[#9ca3af] mt-6 font-mono">
          {t('login.mockAccounts')}
        </p>
      </div>
    </div>
  );
}
