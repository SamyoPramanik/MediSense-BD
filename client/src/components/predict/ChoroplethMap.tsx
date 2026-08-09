'use client';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { BANGLADESH_CENTER, BANGLADESH_ZOOM } from '@/lib/constants';

interface DiseaseInfo {
  disease: string;
  predicted_cases: number;
  probability: number;
  risk: number;
}

interface OutbreakItem {
  district_id: number;
  name: string;
  name_bn: string;
  lat: number;
  lng: number;
  diseases: DiseaseInfo[];
  max_risk: number;
}

function getColor(risk: number): string {
  if (risk > 0.08) return '#ef4444';
  if (risk > 0.04) return '#f97316';
  if (risk > 0.02) return '#f59e0b';
  if (risk > 0.01) return '#eab308';
  return '#22c55e';
}

export default function ChoroplethMap({ outbreaks, onDistrictClick }: { outbreaks: OutbreakItem[]; onDistrictClick: (id: number, name: string) => void }) {
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
            radius={item.max_risk ? Math.max(8, item.max_risk * 150) : 6}
            fillColor={getColor(item.max_risk || 0)}
            fillOpacity={0.6}
            stroke={true}
            color={getColor(item.max_risk || 0)}
            weight={1.5}
            opacity={0.8}
            eventHandlers={{ click: () => onDistrictClick(item.district_id, item.name) }}
          >

            <Tooltip direction="top" offset={[0, -10]} className="!bg-transparent !border-0 !shadow-none">
              <div className="glass-card !rounded-lg px-3 py-2 text-xs" style={{ background: 'rgba(10,46,46,0.95)' }}>
                <p className="font-semibold text-white">{item.name} <span className="text-white/40">{item.name_bn}</span></p>
                {item.diseases && item.diseases.length > 0 && (
                  <div className="mt-1 space-y-0.5 border-t border-white/10 pt-1">
                    {item.diseases.map((d) => (
                      <p key={d.disease} className="text-white/80">
                        {d.disease}:{d.predicted_cases}, {d.probability.toFixed(2)},
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
