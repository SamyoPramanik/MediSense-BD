'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function TopBar() {
  const { user, logout } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Awaited<ReturnType<typeof searchApi.search>> | null>(null);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowResults(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length < 2) { setResults(null); setShowResults(false); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await searchApi.search(val);
        setResults(data);
        setShowResults(true);
      } catch { setResults(null); }
    }, 300);
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b relative z-20" style={{ background: 'rgba(3, 28, 28, 0.6)', backdropFilter: 'blur(20px)', borderColor: 'rgba(255,255,255,0.08)' }}>
      {/* Global Search */}
      <div ref={searchRef} className="relative flex-1 max-w-xl">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            id="global-search"
            type="text"
            placeholder="Search districts, hospitals, drugs..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="glass-input w-full pl-10 pr-4 py-2.5 text-sm"
          />
        </div>
        <AnimatePresence>
          {showResults && results && results.total > 0 && (
            <motion.div
              className="absolute top-full left-0 right-0 mt-2 glass-card p-3 max-h-80 overflow-y-auto"
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              style={{ background: 'rgba(10, 46, 46, 0.95)' }}
            >
              {results.districts.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-teal-400 font-semibold uppercase tracking-wider mb-1">Districts</p>
                  {results.districts.map((d) => (
                    <Link key={d.id} href={`/predict?district=${d.id}`} onClick={() => setShowResults(false)}
                      className="block px-3 py-1.5 rounded-lg hover:bg-white/5 text-sm text-white/80">{d.name} — {d.division}</Link>
                  ))}
                </div>
              )}
              {results.hospitals.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-teal-400 font-semibold uppercase tracking-wider mb-1">Hospitals</p>
                  {results.hospitals.map((h) => (
                    <Link key={h.id} href="/navigate" onClick={() => setShowResults(false)}
                      className="block px-3 py-1.5 rounded-lg hover:bg-white/5 text-sm text-white/80">{h.name}</Link>
                  ))}
                </div>
              )}
              {results.drugs.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-teal-400 font-semibold uppercase tracking-wider mb-1">Drugs</p>
                  {results.drugs.map((d) => (
                    <Link key={d.id} href="/verify" onClick={() => setShowResults(false)}
                      className="block px-3 py-1.5 rounded-lg hover:bg-white/5 text-sm text-white/80">
                      {d.brand_name} <span className="text-white/40">({d.generic_name})</span>
                      {d.status === 'counterfeit' && <span className="ml-2 text-red-400 text-xs">⚠ Counterfeit</span>}
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4 ml-4">
        {/* API Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>
          <span className="text-green-400">API Sync: Online</span>
        </div>

        {/* User */}
        {user && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white shadow" style={{ background: user.gender === 'female' ? 'linear-gradient(135deg, #ec4899, #db2777)' : 'linear-gradient(135deg, #14b8a6, #0d9488)' }}>
              {user.name.charAt(0)}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-white/90 leading-tight">{user.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${user.role === 'admin' || user.role === 'analyst' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'}`}>
                  {user.role}
                </span>
                {user.gender && user.gender !== 'unspecified' && (
                  <span className="text-[10px] text-white/50 capitalize">
                    ({user.gender})
                  </span>
                )}
              </div>
            </div>
            <button onClick={logout} className="text-xs text-white/40 hover:text-white/70 transition-colors ml-1">Logout</button>
          </div>
        )}
      </div>
    </header>
  );
}

