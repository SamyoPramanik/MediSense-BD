'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { navigateApi } from '@/lib/api';
import GlassCard from '@/components/ui/GlassCard';

const RoutingMap = dynamic(() => import('@/components/navigate/RoutingMap'), { ssr: false, loading: () => <div className="w-full h-[calc(100vh-180px)] glass-card flex items-center justify-center"><div className="w-6 h-6 border-2 border-teal-500/30 border-t-teal-400 rounded-full animate-spin"/></div> });

type Hospital = Awaited<ReturnType<typeof navigateApi.hospitals>>[0];
type EquityPoint = Awaited<ReturnType<typeof navigateApi.equityHeatmap>>[0];

export default function NavigatePage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [equityData, setEquityData] = useState<EquityPoint[]>([]);
  const [showEquity, setShowEquity] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [nearestHospitals, setNearestHospitals] = useState<Hospital[]>([]);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    navigateApi.hospitals().then(setHospitals).catch(console.error);
    navigateApi.equityHeatmap().then(setEquityData).catch(console.error);
  }, []);

  const detectLocation = () => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setUserLocation(loc);
          try {
            const nearest = await navigateApi.nearest(loc[0], loc[1]);
            setNearestHospitals(nearest as unknown as Hospital[]);
          } catch (err) { console.error(err); }
          setLocating(false);
        },
        () => {
          // Fallback to Dhaka center
          setUserLocation([23.8103, 90.4125]);
          setLocating(false);
        }
      );
    }
  };

  return (
    <div className="relative">
      <div className="mb-6">
        <h1 className="text-3xl font-bold gradient-text" style={{ fontFamily: 'Outfit' }}>Healthcare Navigation</h1>
        <p className="text-white/40 text-sm mt-1">Find nearest emergency facilities with optimized routing</p>
      </div>

      <div className="relative">
        {/* Floating SOS Panel */}
        <div className="absolute top-4 left-4 z-10 w-72">
          <GlassCard className="!p-4 space-y-3" style={{ background: 'rgba(10,46,46,0.9)' }}>
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"/>
              Emergency SOS Routing
            </h3>
            <button
              onClick={detectLocation}
              disabled={locating}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
              style={{ background: locating ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #ef4444, #dc2626)' }}
            >
              {locating ? '📍 Detecting...' : '📍 Detect My Location'}
            </button>

            {nearestHospitals.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {nearestHospitals.map((h, i) => (
                  <div key={h.id} className="p-2 rounded-lg bg-white/5 text-xs">
                    <p className="font-semibold text-teal-300">{i + 1}. {h.name}</p>
                    <p className="text-white/40 mt-0.5">{(h as unknown as { distance_km: number }).distance_km?.toFixed(1)} km away • {h.available_beds} beds available</p>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showEquity}
                  onChange={(e) => setShowEquity(e.target.checked)}
                  className="w-4 h-4 rounded accent-teal-500"
                />
                <span className="text-xs text-white/50">Show Health Equity Heatmap</span>
              </label>
            </div>
          </GlassCard>
        </div>

        {/* Map */}
        <RoutingMap hospitals={hospitals} equityData={showEquity ? equityData : []} userLocation={userLocation} />
      </div>
    </div>
  );
}
