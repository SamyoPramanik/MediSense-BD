'use client';
import { useAuth } from '@/hooks/useAuth';
import GlassCard from '@/components/ui/GlassCard';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text" style={{ fontFamily: 'Outfit' }}>Settings</h1>
        <p className="text-white/40 text-sm mt-1">System configuration and preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <GlassCard>
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Account</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-white/40">Name</span><span className="text-white/80">{user?.name}</span></div>
            <div className="flex justify-between"><span className="text-white/40">Email</span><span className="text-white/80">{user?.email}</span></div>
            <div className="flex justify-between"><span className="text-white/40">Role</span><span className="text-teal-400 capitalize">{user?.role}</span></div>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">System Status</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-white/40">Backend API</span><span className="text-green-400">● Connected</span></div>
            <div className="flex justify-between"><span className="text-white/40">ML Inference</span><span className="text-green-400">● Online</span></div>
            <div className="flex justify-between"><span className="text-white/40">Database</span><span className="text-green-400">● Healthy</span></div>
            <div className="flex justify-between"><span className="text-white/40">DGDA Registry</span><span className="text-green-400">● Synced</span></div>
          </div>
        </GlassCard>

        <GlassCard className="md:col-span-2">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">About</h3>
          <p className="text-sm text-white/60 leading-relaxed">
            MediSense BD is a Unified Health Intelligence Platform for Bangladesh, combining epidemic forecasting (PREDICT), 
            healthcare navigation (NAVIGATE), and drug verification (VERIFY) into a single mission control interface. 
            Powered by LSTM neural networks, BanglaBERT NLP, and the DGDA National Drug Registry.
          </p>
          <p className="text-xs text-white/20 mt-4">Version 1.0.0 • Built with Next.js, Express.js, PostgreSQL, and PyTorch</p>
        </GlassCard>
      </div>
    </div>
  );
}
