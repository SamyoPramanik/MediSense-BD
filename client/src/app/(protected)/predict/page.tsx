'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { predictApi } from '@/lib/api';
import SlideDrawer from '@/components/ui/SlideDrawer';
import GlassCard from '@/components/ui/GlassCard';
import { API_BASE } from '@/lib/constants';

// Lazy load map to avoid SSR issues
const ChoroplethMap = dynamic(() => import('@/components/predict/ChoroplethMap'), { ssr: false, loading: () => <div className="w-full h-[600px] glass-card flex items-center justify-center"><div className="w-6 h-6 border-2 border-teal-500/30 border-t-teal-400 rounded-full animate-spin"/></div> });
const ForecastChart = dynamic(() => import('@/components/predict/ForecastChart'), { ssr: false });

type OutbreakData = Awaited<ReturnType<typeof predictApi.outbreaks>>;
type DistrictDetail = Awaited<ReturnType<typeof predictApi.district>>;

export default function PredictPage() {
  const [outbreaks, setOutbreaks] = useState<OutbreakData>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);
  const [districtDetail, setDistrictDetail] = useState<DistrictDetail | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [runningPred, setRunningPred] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    predictApi.outbreaks().then(setOutbreaks).catch(console.error);
  }, []);

  const handleDistrictClick = async (districtId: number) => {
    setSelectedDistrict(districtId);
    setDrawerOpen(true);
    try {
      const data = await predictApi.district(districtId);
      setDistrictDetail(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunPrediction = async () => {
    setRunningPred(true);
    setStatusMessage('Training model and generating next-day forecasts...');
    try {
      const res = await predictApi.run();
      setStatusMessage(`Success: ${res.message} (Trained rows: ${res.trained_rows})`);
      // Reload outbreak data to update the map
      const updatedOutbreaks = await predictApi.outbreaks();
      setOutbreaks(updatedOutbreaks);
    } catch (err: any) {
      console.error(err);
      setStatusMessage(`Error: ${err.message || 'Failed to run prediction model'}`);
    } finally {
      setRunningPred(false);
      setTimeout(() => setStatusMessage(null), 8000);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      const token = localStorage.getItem('medisense_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/predict/export`, { headers });
      if (!res.ok) throw new Error('Export request failed');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'outbreak_predictions.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Download failed: ${err.message || err}`);
    }
  };

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text" style={{ fontFamily: 'Outfit' }}>Epidemic Forecasting</h1>
          <p className="text-white/40 text-sm mt-1">Outbreak probability maps powered by LSTM & Random Forest models</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/predict/upload">
            <button className="px-4 py-2 rounded-xl bg-teal-900/40 text-teal-300 border border-teal-500/20 hover:bg-teal-800/40 hover:border-teal-500/40 transition-all text-sm font-semibold flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
              Upload Dataset
            </button>
          </Link>
          <button
            onClick={handleRunPrediction}
            disabled={runningPred}
            className="px-4 py-2 rounded-xl bg-teal-500 text-white hover:bg-teal-400 disabled:bg-teal-500/40 disabled:text-white/40 disabled:cursor-not-allowed transition-all text-sm font-semibold flex items-center gap-2"
          >
            {runningPred ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            )}
            Run Prediction
          </button>
          <button
            onClick={handleDownloadCSV}
            className="px-4 py-2 rounded-xl bg-white/5 text-white/80 border border-white/10 hover:bg-white/10 transition-all text-sm font-semibold flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            Download CSV
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="mb-6 p-4 rounded-xl border border-teal-500/20 text-sm" style={{ background: 'rgba(10,46,46,0.95)' }}>
          <div className="flex items-center gap-3">
            {runningPred ? (
              <div className="w-4 h-4 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin flex-shrink-0"/>
            ) : (
              <div className="w-2 h-2 rounded-full bg-teal-400 flex-shrink-0"/>
            )}
            <p className="text-white/80">{statusMessage}</p>
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'High Risk Districts', value: outbreaks.filter(o => o.max_risk > 0.08).length, color: '#ef4444' },
          { label: 'Moderate Risk', value: outbreaks.filter(o => o.max_risk > 0.04 && o.max_risk <= 0.08).length, color: '#f59e0b' },
          { label: 'Low Risk', value: outbreaks.filter(o => !o.max_risk || o.max_risk <= 0.04).length, color: '#22c55e' },
        ].map((s) => (
          <GlassCard key={s.label} className="!p-4">
            <p className="text-xs text-white/40 uppercase tracking-wider">{s.label}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: s.color, fontFamily: 'Outfit' }}>{s.value}</p>
          </GlassCard>
        ))}
      </div>

      {/* Choropleth Map */}
      <ChoroplethMap outbreaks={outbreaks} onDistrictClick={handleDistrictClick} />

      {/* Detail Drawer */}
      <SlideDrawer
        isOpen={drawerOpen}
        onClose={() => { setDrawerOpen(false); setSelectedDistrict(null); }}
        title={districtDetail?.district.name || 'Loading...'}
        width="max-w-xl"
      >
        {districtDetail ? (
          <div className="space-y-6">
            {/* District info */}
            <div className="grid grid-cols-2 gap-3">
              <GlassCard className="!p-3">
                <p className="text-xs text-white/40">Division</p>
                <p className="text-sm font-semibold text-teal-300">{districtDetail.district.division}</p>
              </GlassCard>
              <GlassCard className="!p-3">
                <p className="text-xs text-white/40">Population</p>
                <p className="text-sm font-semibold text-teal-300">{(districtDetail.district.population / 1e6).toFixed(1)}M</p>
              </GlassCard>
            </div>

            {/* Forecast Chart */}
            <div>
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">LSTM Time-Series Forecast</h3>
              <ForecastChart predictions={districtDetail.predictions} />
            </div>

            {/* Weather forecast history log */}
            {districtDetail.predictions.length > 0 && (() => {
              const uniqueWeatherLogs = Object.values(
                districtDetail.predictions.reduce((acc: Record<string, any>, p) => {
                  const rawDate = p.predicted_date;
                  if (!acc[rawDate]) {
                    acc[rawDate] = {
                      date: rawDate,
                      dateFormatted: new Date(rawDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                      temperature: p.temperature,
                      humidity: p.humidity,
                      rainfall_mm: p.rainfall_mm,
                      season_type: p.season_type,
                    };
                  }
                  return acc;
                }, {})
              ).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

              return (
                <div>
                  <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">Weather Forecast Log</h3>
                  <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto max-h-[220px]">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-white/10" style={{ background: 'rgba(255,255,255,0.02)' }}>
                            <th className="p-2 font-medium text-white/60">Date</th>
                            <th className="p-2 font-medium text-white/60">Temp</th>
                            <th className="p-2 font-medium text-white/60">Humidity</th>
                            <th className="p-2 font-medium text-white/60">Rainfall</th>
                            <th className="p-2 font-medium text-white/60">Season</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {uniqueWeatherLogs.map((log: any) => (
                            <tr key={log.date} className="hover:bg-white/5 transition-colors">
                              <td className="p-2 font-medium text-white">{log.dateFormatted}</td>
                              <td className="p-2 text-white/80">{log.temperature !== null && log.temperature !== undefined ? `${log.temperature}°C` : '-'}</td>
                              <td className="p-2 text-white/80">{log.humidity !== null && log.humidity !== undefined ? `${log.humidity}%` : '-'}</td>
                              <td className="p-2 text-white/80">{log.rainfall_mm !== null && log.rainfall_mm !== undefined ? `${log.rainfall_mm} mm` : '-'}</td>
                              <td className="p-2 text-teal-400 font-medium">{log.season_type || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Climate metrics */}
            {districtDetail.predictions.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">Climate Correlation</h3>
                <div className="grid grid-cols-2 gap-3">
                  <GlassCard className="!p-3">
                    <p className="text-xs text-white/40">Temperature</p>
                    <p className="text-lg font-bold text-amber-400">{districtDetail.predictions[districtDetail.predictions.length - 1]?.temperature}°C</p>
                  </GlassCard>
                  <GlassCard className="!p-3">
                    <p className="text-xs text-white/40">Humidity</p>
                    <p className="text-lg font-bold text-blue-400">{districtDetail.predictions[districtDetail.predictions.length - 1]?.humidity}%</p>
                  </GlassCard>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-teal-500/30 border-t-teal-400 rounded-full animate-spin"/>
          </div>
        )}
      </SlideDrawer>
    </div>
  );
}
