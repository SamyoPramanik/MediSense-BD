'use client';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export default function GlassCard({ children, className = '', hover = false, glow = false, onClick, style }: GlassCardProps) {
  return (
    <motion.div
      className={`glass-card p-6 ${hover ? 'cursor-pointer' : ''} ${glow ? 'animate-pulse-glow' : ''} ${className}`}
      style={style}
      whileHover={hover ? { scale: 1.02, y: -4 } : {}}
      whileTap={hover ? { scale: 0.98 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
