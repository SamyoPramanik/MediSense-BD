'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface SlideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  width?: string;
}

export default function SlideDrawer({ isOpen, onClose, children, title, width = 'max-w-lg' }: SlideDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(3, 28, 28, 0.6)', backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Drawer */}
          <motion.div
            className={`fixed top-0 right-0 h-full ${width} w-full z-50 glass-card rounded-l-2xl rounded-r-none border-r-0 overflow-y-auto`}
            style={{ background: 'rgba(10, 46, 46, 0.95)', backdropFilter: 'blur(40px)' }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                {title && <h2 className="text-xl font-semibold gradient-text" style={{ fontFamily: 'Outfit' }}>{title}</h2>}
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors" aria-label="Close drawer">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
