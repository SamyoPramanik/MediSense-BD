'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { predictApi } from '@/lib/api';
import SlideDrawer from '@/components/ui/SlideDrawer';
import GlassCard from '@/components/ui/GlassCard';

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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold gradient-text" style={{ fontFamily: 'Outfit' }}>Epidemic Forecasting</h1>
        <p className="text-white/40 text-sm mt-1">7-day outbreak probability map powered by LSTM neural networks</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'High Risk Districts', value: outbreaks.filter(o => o.probability > 0.8).length, color: '#ef4444' },
          { label: 'Moderate Risk', value: outbreaks.filter(o => o.probability > 0.5 && o.probability <= 0.8).length, color: '#f59e0b' },
          { label: 'Low Risk', value: outbreaks.filter(o => o.probability !== null && o.probability <= 0.5).length, color: '#22c55e' },
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
