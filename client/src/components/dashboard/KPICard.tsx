'use client';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  delay?: number;
}

export default function KPICard({ title, value, subtitle, icon, color, delay = 0 }: KPICardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0;

  useEffect(() => {
    const duration = 1500;
    const start = Date.now();
    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(numericValue * eased * 10) / 10);
      if (progress < 1) requestAnimationFrame(animate);
    };
    const timer = setTimeout(animate, delay);
    return () => clearTimeout(timer);
  }, [numericValue, delay]);

  return (
    <motion.div
      className="glass-card p-6 relative overflow-hidden group cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000, duration: 0.5 }}
      whileHover={{ scale: 1.03, y: -4 }}
    >
      {/* Gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />

      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-xs text-white/40 uppercase tracking-wider font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold" style={{ fontFamily: 'Outfit', color }}>
            {typeof value === 'number' ? displayValue : value}
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity"
          style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
          {icon}
        </div>
      </div>
      <p className="text-sm text-white/50">{subtitle}</p>

      {/* Background glow */}
      <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full opacity-5 group-hover:opacity-10 transition-opacity" style={{ background: color }} />
    </motion.div>
  );
}
