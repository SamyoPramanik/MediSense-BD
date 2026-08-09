'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { NAV_ITEMS } from '@/lib/constants';
import { useAuth } from '@/hooks/useAuth';

const icons: Record<string, React.ReactNode> = {
  dashboard: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  ),
  predict: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  ),
  navigate: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 5.4 7 12 8 12s8-6.6 8-12a8 8 0 0 0-8-8z"/>
    </svg>
  ),
  verify: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>
    </svg>
  ),
  femaleCare: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f472b6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  settings: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2m-9-11h2m18 0h2m-3.64-6.36-1.41 1.41M6.05 17.95l-1.41 1.41m0-12.72 1.41 1.41M17.95 17.95l1.41 1.41"/>
    </svg>
  ),
  audit: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
};

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  // Dynamically include femaleCare link if user is female
  const isFemale = user?.gender?.toLowerCase() === 'female';
  
  const navItemsList = [
    NAV_ITEMS[0], // Dashboard
    NAV_ITEMS[1], // Predict
    NAV_ITEMS[2], // Navigate
    NAV_ITEMS[3], // Verify
    ...(isFemale ? [{ id: 'female-care', label: 'Female Care AI', href: '/female-care', icon: 'femaleCare' }] : []),
    { id: 'audit', label: 'Audit & Logs', href: '/audit', icon: 'audit' },
    NAV_ITEMS[4], // Settings
  ];


  return (
    <motion.aside
      className="sticky top-0 h-screen z-30 flex flex-col border-r flex-shrink-0"
      style={{
        background: 'rgba(3, 28, 28, 0.85)',
        backdropFilter: 'blur(20px)',
        borderColor: 'rgba(255,255,255,0.08)',
      }}
      initial={{ width: collapsed ? 72 : 220 }}
      animate={{ width: collapsed ? 72 : 220 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overflow-hidden whitespace-nowrap">
              <span className="text-lg font-bold gradient-text" style={{ fontFamily: 'Outfit' }}>MediSense</span>
              <span className="text-[10px] ml-1 text-teal-400 opacity-60">BD</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItemsList.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          const isFemaleItem = item.id === 'female-care';

          return (
            <Link key={item.id} href={item.href}>
              <motion.div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative ${
                  active
                    ? isFemaleItem ? 'text-pink-300 font-semibold' : 'text-white font-semibold'
                    : isFemaleItem ? 'text-pink-400/80 hover:text-pink-300 hover:bg-pink-500/10' : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                }`}
                whileHover={{ x: 2 }}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: isFemaleItem ? 'rgba(244, 114, 182, 0.15)' : 'rgba(20, 184, 166, 0.15)',
                      border: isFemaleItem ? '1px solid rgba(244, 114, 182, 0.3)' : '1px solid rgba(20, 184, 166, 0.3)',
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex-shrink-0">{icons[item.icon]}</span>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="relative z-10 text-sm whitespace-nowrap flex items-center justify-between w-full">
                      <span>{item.label}</span>
                      {isFemaleItem && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">AI</span>}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="m-3 p-2 rounded-xl hover:bg-white/5 transition-colors text-white/40 hover:text-white/70 flex items-center justify-center"
        aria-label="Toggle sidebar"
      >
        <motion.svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          animate={{ rotate: collapsed ? 180 : 0 }}>
          <path d="M15 18l-6-6 6-6"/>
        </motion.svg>
      </button>
    </motion.aside>
  );
}
