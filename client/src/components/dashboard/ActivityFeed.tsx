'use client';
import { motion } from 'framer-motion';

interface FeedItem {
  id: number;
  category: string;
  message: string;
  severity: string;
  created_at: string;
}

const severityColors: Record<string, string> = {
  critical: '#ef4444',
  warning: '#f59e0b',
  info: '#14b8a6',
};

const categoryIcons: Record<string, string> = {
  predict: '📊',
  verify: '🔍',
  navigate: '🗺️',
};

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function ActivityFeed({ items }: { items: FeedItem[] }) {
  return (
    <div className="glass-card p-6">
      <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4" style={{ fontFamily: 'Outfit' }}>
        Recent Activity
      </h3>
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: severityColors[item.severity] || '#14b8a6' }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white/80 leading-relaxed">{categoryIcons[item.category] || '📌'} {item.message}</p>
              <p className="text-xs text-white/30 mt-1">{timeAgo(item.created_at)}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
