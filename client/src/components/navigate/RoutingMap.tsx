'use client';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import { BANGLADESH_CENTER, BANGLADESH_ZOOM } from '@/lib/constants';

// Fix leaflet default marker icon
const hospitalIcon = new L.DivIcon({
  html: `<div style="background:linear-gradient(135deg,#14b8a6,#0d9488);width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid rgba(255,255,255,0.3);box-shadow:0 2px 8px rgba(0,0,0,0.3)">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M19 8h-2V6h-2V4h-2V2h-2v2H9v2H7v2H5v2H3v12h18V8h-2zm-7 11H9v-5h3v5zm4 0h-3v-5h3v5z"/></svg>
  </div>`,
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const userIcon = new L.DivIcon({
  html: `<div style="background:#3b82f6;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 0 15px rgba(59,130,246,0.5)"></div>`,
  className: '',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function equityColor(score: number): string {
  if (score > 0.8) return '#22c55e';
  if (score > 0.6) return '#eab308';
  if (score > 0.4) return '#f97316';
  return '#ef4444';
}

function FlyToUser({ location }: { location: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (location) map.flyTo(location, 12, { duration: 1.5 });
  }, [location, map]);
  return null;
}

interface Props {
  hospitals: Array<{ id: number; name: string; lat: number; lng: number; type: string; total_beds: number; available_beds: number; has_emergency: boolean; phone: string; district_name: string }>;
  equityData: Array<{ lat: number; lng: number; equity_score: number; upazila_name: string; district_name: string }>;
  userLocation: [number, number] | null;
}

export default function RoutingMap({ hospitals, equityData, userLocation }: Props) {
  return (
    <div className="glass-card overflow-hidden" style={{ height: 'calc(100vh - 180px)' }}>
      <MapContainer center={BANGLADESH_CENTER} zoom={BANGLADESH_ZOOM} className="w-full h-full" style={{ background: '#031c1c' }} attributionControl={false}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        <FlyToUser location={userLocation} />

        {/* Equity heatmap circles */}
        {equityData.map((e, i) => (
          <CircleMarker key={`eq-${i}`} center={[e.lat, e.lng]} radius={18} fillColor={equityColor(e.equity_score)} fillOpacity={0.25} stroke={false}>
            <Popup>
              <div className="text-xs">
                <p className="font-semibold">{e.upazila_name}</p>
                <p>{e.district_name} — Score: {e.equity_score.toFixed(2)}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Hospital markers */}
        {hospitals.map((h) => (
          <Marker key={h.id} position={[h.lat, h.lng]} icon={hospitalIcon}>
            <Popup>
              <div className="text-xs" style={{ minWidth: '180px' }}>
                <p className="font-bold text-sm">{h.name}</p>
                <p className="text-gray-600">{h.district_name} • {h.type.replace('_', ' ')}</p>
                <p className="mt-1">🛏️ {h.available_beds}/{h.total_beds} beds</p>
                {h.has_emergency && <p className="text-red-600 font-semibold">🚨 Emergency Available</p>}
                {h.phone && <p>📞 {h.phone}</p>}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* User location */}
        {userLocation && (
          <>
            <Marker position={userLocation} icon={userIcon}>
              <Popup><span className="text-xs font-semibold">Your Location</span></Popup>
            </Marker>
            <CircleMarker center={userLocation} radius={40} fillColor="#3b82f6" fillOpacity={0.08} stroke={false} />
          </>
        )}
      </MapContainer>
    </div>
  );
}
