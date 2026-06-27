'use client';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { BANGLADESH_CENTER, BANGLADESH_ZOOM } from '@/lib/constants';

interface OutbreakItem {
  district_id: number;
  name: string;
  name_bn: string;
  lat: number;
  lng: number;
  probability: number;
  predicted_cases: number;
  disease: string;
}

function getColor(prob: number): string {
  if (prob > 0.85) return '#ef4444';
  if (prob > 0.7) return '#f97316';
  if (prob > 0.5) return '#f59e0b';
  if (prob > 0.3) return '#eab308';
  return '#22c55e';
}

export default function ChoroplethMap({ outbreaks, onDistrictClick }: { outbreaks: OutbreakItem[]; onDistrictClick: (id: number) => void }) {
  return (
    <div className="glass-card overflow-hidden" style={{ height: '600px' }}>
      <MapContainer center={BANGLADESH_CENTER} zoom={BANGLADESH_ZOOM} className="w-full h-full" style={{ background: '#031c1c' }}
        zoomControl={true} attributionControl={false}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; CartoDB'
        />
        {outbreaks.filter(o => o.lat && o.lng).map((item) => (
          <CircleMarker
            key={item.district_id}
            center={[item.lat, item.lng]}
            radius={item.probability ? Math.max(8, item.probability * 25) : 6}
            fillColor={getColor(item.probability || 0)}
            fillOpacity={0.6}
            stroke={true}
            color={getColor(item.probability || 0)}
            weight={1.5}
            opacity={0.8}
            eventHandlers={{ click: () => onDistrictClick(item.district_id) }}
          >
            <Tooltip direction="top" offset={[0, -10]} className="!bg-transparent !border-0 !shadow-none">
              <div className="glass-card !rounded-lg px-3 py-2 text-xs" style={{ background: 'rgba(10,46,46,0.95)' }}>
                <p className="font-semibold text-white">{item.name} <span className="text-white/40">{item.name_bn}</span></p>
                {item.probability && (
                  <>
                    <p className="text-white/60">{item.disease}: <span style={{ color: getColor(item.probability) }}>{(item.probability * 100).toFixed(0)}%</span></p>
                    <p className="text-white/40">{item.predicted_cases} predicted cases</p>
                  </>
                )}
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
