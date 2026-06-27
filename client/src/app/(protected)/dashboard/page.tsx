'use client';
import { useEffect, useState } from 'react';
import { dashboardApi } from '@/lib/api';
import KPICard from '@/components/dashboard/KPICard';
import ActivityFeed from '@/components/dashboard/ActivityFeed';

export default function DashboardPage() {
  const [kpi, setKpi] = useState<Awaited<ReturnType<typeof dashboardApi.kpi>> | null>(null);
  const [feed, setFeed] = useState<Awaited<ReturnType<typeof dashboardApi.feed>>>([]);

  useEffect(() => {
    dashboardApi.kpi().then(setKpi).catch(console.error);
    dashboardApi.feed().then(setFeed).catch(console.error);
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text" style={{ fontFamily: 'Outfit' }}>Mission Control</h1>
        <p className="text-white/40 text-sm mt-1">Unified health intelligence overview for Bangladesh</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <KPICard
          title="Active Outbreak Warnings"
          value={kpi?.outbreaks.active_warnings ?? 0}
          subtitle={`${kpi?.outbreaks.total_predicted_cases ?? 0} predicted cases (7-day)`}
          color="#ef4444"
          delay={0}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          }
        />
        <KPICard
          title="National Health Equity Index"
          value={kpi?.equity.national_index ?? 0}
          subtitle={`${kpi?.equity.upazilas_measured ?? 0} upazilas measured`}
          color="#14b8a6"
          delay={150}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 5.4 7 12 8 12s8-6.6 8-12a8 8 0 0 0-8-8z"/>
            </svg>
          }
        />
        <KPICard
          title="Counterfeit Detection Rate"
          value={`${kpi?.verification.detection_rate ?? 0}%`}
          subtitle={`${kpi?.verification.counterfeit_found ?? 0} counterfeit found of ${kpi?.verification.total_scans ?? 0} scans`}
          color="#f59e0b"
          delay={300}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>
            </svg>
          }
        />
      </div>

      {/* Activity Feed */}
      <ActivityFeed items={feed} />
    </div>
  );
}
