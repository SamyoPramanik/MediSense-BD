'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

export default function LoginCard() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<string>('female');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'signin') {
        await login(email, password);
      } else {
        await signup({ email, password, full_name: fullName, gender });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : `${mode === 'signin' ? 'Sign In' : 'Sign Up'} failed`);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
    setError('');
    setLoading(true);
    try {
      await login(quickEmail, quickPass);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="relative z-10 w-full max-w-md mx-auto"
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="glass-card p-8">
        {/* Logo Header */}
        <div className="text-center mb-6">
          <motion.div
            className="w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
          <h1 className="text-2xl font-bold gradient-text" style={{ fontFamily: 'Outfit' }}>MediSense BD</h1>
          <p className="text-white/40 text-xs mt-1">Unified Health Intelligence & AI Platform</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-white/5 p-1 mb-6 border border-white/10">
          <button
            type="button"
            onClick={() => { setMode('signin'); setError(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${mode === 'signin' ? 'bg-teal-500 text-white shadow-md' : 'text-white/50 hover:text-white'}`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${mode === 'signup' ? 'bg-teal-500 text-white shadow-md' : 'text-white/50 hover:text-white'}`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {mode === 'signup' && (
              <motion.div
                key="signup-fields"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                <div>
                  <label className="text-xs text-white/50 font-medium uppercase tracking-wider mb-1 block">Full Name</label>
                  <input
                    id="signup-fullname"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="glass-input w-full"
                    placeholder="e.g. Nusrat Jahan"
                    required={mode === 'signup'}
                  />
                </div>

                <div>
                  <label className="text-xs text-white/50 font-medium uppercase tracking-wider mb-1 block">Gender</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'female', label: 'Female ♀' },
                      { id: 'male', label: 'Male ♂' },
                      { id: 'other', label: 'Other' }
                    ].map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setGender(g.id)}
                        className={`py-2 text-xs font-medium rounded-lg border transition-all ${gender === g.id ? 'bg-teal-500/20 border-teal-400 text-teal-300' : 'bg-white/5 border-white/10 text-white/50 hover:text-white/80'}`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                  {gender === 'female' && (
                    <p className="text-[11px] text-teal-400/80 mt-1 flex items-center gap-1">
                      ✨ Dedicated Nari Healthcare & AI Mental Guide unlocked in Navbar.
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="text-xs text-white/50 font-medium uppercase tracking-wider mb-1 block">Email Address</label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="glass-input w-full"
              placeholder="user@medisense.bd"
              required
            />
          </div>

          <div>
            <label className="text-xs text-white/50 font-medium uppercase tracking-wider mb-1 block">Password</label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="glass-input w-full"
              placeholder="••••••••••••"
              required
            />
          </div>

          {error && (
            <motion.p className="text-red-400 text-xs text-center font-medium" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {error}
            </motion.p>
          )}

          <motion.button
            id="auth-submit"
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-50 transition-all mt-2"
            style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}
            whileHover={{ scale: 1.02, boxShadow: '0 0 25px rgba(20, 184, 166, 0.3)' }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <motion.span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8 }}/>
                {mode === 'signin' ? 'Authenticating...' : 'Creating Account...'}
              </span>
            ) : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </motion.button>
        </form>

        {/* Quick Demo Logins */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <p className="text-white/40 text-xs mb-2 font-medium">Quick Demo Accounts:</p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('female@medisense.bd', 'password123')}
              className="px-2.5 py-1 rounded-lg text-[11px] bg-teal-500/20 text-teal-300 border border-teal-500/30 hover:bg-teal-500/30 transition-all"
            >
              👩 Female User
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('user@medisense.bd', 'password123')}
              className="px-2.5 py-1 rounded-lg text-[11px] bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 transition-all"
            >
              👨 Regular User
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@medisense.bd', 'medisense2026')}
              className="px-2.5 py-1 rounded-lg text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-all"
            >
              🛡️ Admin / Analyst
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
