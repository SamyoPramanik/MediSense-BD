'use client';
import { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { navigateApi } from '@/lib/api';
import GlassCard from '@/components/ui/GlassCard';

const RoutingMap = dynamic(() => import('@/components/navigate/RoutingMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[calc(100vh-180px)] glass-card flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-teal-500/30 border-t-teal-400 rounded-full animate-spin" />
    </div>
  ),
});

type Hospital = Awaited<ReturnType<typeof navigateApi.hospitals>>[0];
type EquityPoint = Awaited<ReturnType<typeof navigateApi.equityHeatmap>>[0];

// Haversine distance helper (in KM)
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function NavigatePage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [equityData, setEquityData] = useState<EquityPoint[]>([]);
  const [showEquity, setShowEquity] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [nearestHospitals, setNearestHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
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
            if (!selectedHospital && nearest.length > 0) {
              setSelectedHospital(nearest[0] as unknown as Hospital);
            }
          } catch (err) {
            console.error(err);
          }
          setLocating(false);
        },
        () => {
          // Fallback to Dhaka center
          const fallbackLoc: [number, number] = [23.8103, 90.4125];
          setUserLocation(fallbackLoc);
          setLocating(false);
        }
      );
    } else {
      setUserLocation([23.8103, 90.4125]);
      setLocating(false);
    }
  };

  const handleSelectHospital = (hospital: Hospital | null) => {
    setSelectedHospital(hospital);
    if (!userLocation && hospital) {
      setUserLocation([23.8103, 90.4125]);
    }
  };

  const filteredHospitals = useMemo(() => {
    if (!searchQuery.trim()) return hospitals;
    const q = searchQuery.toLowerCase();
    return hospitals.filter(
      (h) => h.name.toLowerCase().includes(q) || (h.district_name && h.district_name.toLowerCase().includes(q))
    );
  }, [hospitals, searchQuery]);

  const activeDistance = useMemo(() => {
    if (!selectedHospital) return null;
    const origin = userLocation || [23.8103, 90.4125];
    return calculateDistanceKm(origin[0], origin[1], selectedHospital.lat, selectedHospital.lng);
  }, [selectedHospital, userLocation]);

  return (
    <div className="relative space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-text" style={{ fontFamily: 'Outfit' }}>
          Healthcare Navigation & SOS Routing
        </h1>
        <p className="text-white/50 text-sm mt-1">
          Click any hospital name to display its live emergency route on the map
        </p>
      </div>

      <div className="relative">
        {/* Floating SOS Hospital Selector Panel */}
        <div className="absolute top-4 left-4 z-10 w-80 max-w-[calc(100vw-2rem)]">
          <GlassCard className="!p-4 space-y-3 shadow-2xl" style={{ background: 'rgba(10,46,46,0.92)' }}>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white/70 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                Emergency Facilities
              </h3>
              <span className="text-[10px] font-mono text-teal-400">{hospitals.length} Active</span>
            </div>

            {/* Location Detect Button */}
            <button
              onClick={detectLocation}
              disabled={locating}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2"
              style={{ background: locating ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #ef4444, #dc2626)' }}
            >
              <span>{locating ? '📍 Locating GPS...' : '📍 Detect My GPS Location'}</span>
            </button>

            {/* Hospital Search Box */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search hospital by name..."
                className="glass-input text-xs pl-8 pr-3 py-1.5 w-full"
              />
              <svg className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Hospital List (Clicking hospital selects it & shows route) */}
            <div className="space-y-1.5 max-h-56 overflow-y-auto custom-scrollbar pr-1">
              {(nearestHospitals.length > 0 && !searchQuery ? nearestHospitals : filteredHospitals).slice(0, 15).map((h, i) => {
                const isSelected = selectedHospital?.id === h.id;
                const distanceVal = (h as unknown as { distance_km?: number }).distance_km;

                return (
                  <div
                    key={h.id}
                    onClick={() => handleSelectHospital(h)}
                    className={`p-2.5 rounded-xl text-xs cursor-pointer border transition-all ${
                      isSelected
                        ? 'bg-teal-500/20 border-teal-400 text-teal-200 shadow-md font-semibold'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <p className="font-bold text-white text-[12px] hover:text-teal-300 transition-colors">
                        {i + 1}. {h.name}
                      </p>
                      {h.has_emergency && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 border border-red-500/30 flex-shrink-0">
                          🚨 Emergency
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-white/50 mt-1">
                      <span>{h.district_name || 'Bangladesh'}</span>
                      <span className="font-mono text-teal-300">🛏️ {h.available_beds} beds free</span>
                    </div>
                    {distanceVal && (
                      <p className="text-[10px] font-mono text-teal-400 mt-0.5">
                        📍 {distanceVal.toFixed(1)} km away
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Equity Heatmap Toggle */}
            <div className="pt-2 border-t border-white/10">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showEquity}
                  onChange={(e) => setShowEquity(e.target.checked)}
                  className="w-3.5 h-3.5 rounded accent-teal-500"
                />
                <span className="text-[11px] text-white/60">Show Health Equity Heatmap</span>
              </label>
            </div>
          </GlassCard>
        </div>

        {/* Selected Hospital Active Route Card (Top Right Overlay) */}
        {selectedHospital && (
          <div className="absolute top-4 right-4 z-10 w-72">
            <GlassCard className="!p-4 space-y-2 border-teal-500/40 shadow-2xl" style={{ background: 'rgba(3,28,28,0.92)' }}>
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider">🗺️ Active Route</span>
                <button
                  onClick={() => setSelectedHospital(null)}
                  className="text-xs text-white/40 hover:text-white transition-colors"
                >
                  ✕ Clear
                </button>
              </div>

              <p className="font-bold text-xs text-white leading-snug">{selectedHospital.name}</p>
              <p className="text-[11px] text-white/60">{selectedHospital.district_name}</p>

              <div className="pt-1 text-xs space-y-1 font-mono">
                {activeDistance !== null && (
                  <p className="text-teal-300 font-bold">
                    📍 Route Distance: {activeDistance.toFixed(1)} km
                  </p>
                )}
                <p className="text-white/80">🛏️ Available Beds: {selectedHospital.available_beds}</p>
                {selectedHospital.phone && (
                  <p className="text-amber-300">📞 Phone: {selectedHospital.phone}</p>
                )}
              </div>

              {selectedHospital.phone && (
                <a
                  href={`tel:${selectedHospital.phone}`}
                  className="block w-full text-center py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 text-xs font-bold transition-all mt-2"
                >
                  📞 Call Emergency Center
                </a>
              )}
            </GlassCard>
          </div>
        )}

        {/* Map */}
        <RoutingMap
          hospitals={filteredHospitals}
          equityData={showEquity ? equityData : []}
          userLocation={userLocation}
          selectedHospital={selectedHospital}
          onSelectHospital={handleSelectHospital}
        />
      </div>
    </div>
  );
}
