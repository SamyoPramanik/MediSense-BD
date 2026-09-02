'use client';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from 'react';
import { BANGLADESH_CENTER, BANGLADESH_ZOOM } from '@/lib/constants';
import { navigateApi } from '@/lib/api';

// Hospital Marker Icon
const hospitalIcon = new L.DivIcon({
  html: `<div style="background:linear-gradient(135deg,#14b8a6,#0d9488);width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid rgba(255,255,255,0.3);box-shadow:0 2px 8px rgba(0,0,0,0.3)">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M19 8h-2V6h-2V4h-2V2h-2v2H9v2H7v2H5v2H3v12h18V8h-2zm-7 11H9v-5h3v5zm4 0h-3v-5h3v5z"/></svg>
  </div>`,
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

// Selected Destination Hospital Icon (Red Pulsing Pin)
const selectedHospitalIcon = new L.DivIcon({
  html: `<div style="background:linear-gradient(135deg,#ef4444,#dc2626);width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 0 20px rgba(239,68,68,0.8);animation:pulse 1.5s infinite">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
  </div>`,
  className: '',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

// User Location Blue Pin
const userIcon = new L.DivIcon({
  html: `<div style="background:#3b82f6;width:22px;height:22px;border-radius:50%;border:3px solid white;box-shadow:0 0 15px rgba(59,130,246,0.8)"></div>`,
  className: '',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

function equityColor(score: number): string {
  if (score > 0.8) return '#22c55e';
  if (score > 0.6) return '#eab308';
  if (score > 0.4) return '#f97316';
  return '#ef4444';
}

type Hospital = Awaited<ReturnType<typeof navigateApi.hospitals>>[0];

interface Props {
  hospitals: Hospital[];
  equityData: Array<{ lat: number; lng: number; equity_score: number; upazila_name: string; district_name: string }>;
  userLocation: [number, number] | null;
  selectedHospital: Hospital | null;
  onSelectHospital: (hospital: Hospital | null) => void;
  onRouteInfo?: (info: { distanceKm: number; durationMin: number } | null) => void;
}

function MapController({
  selectedHospital,
  userLocation,
  routeGeometry,
}: {
  selectedHospital: Hospital | null;
  userLocation: [number, number] | null;
  routeGeometry: Array<[number, number]>;
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedHospital) {
      if (routeGeometry.length > 0) {
        const bounds = L.latLngBounds(routeGeometry);
        map.fitBounds(bounds, { padding: [70, 70], maxZoom: 15, duration: 1.5 });
      } else {
        const dest: [number, number] = [selectedHospital.lat, selectedHospital.lng];
        if (userLocation) {
          const bounds = L.latLngBounds([userLocation, dest]);
          map.fitBounds(bounds, { padding: [70, 70], maxZoom: 15, duration: 1.5 });
        } else {
          map.flyTo(dest, 14, { duration: 1.5 });
        }
      }
    } else if (userLocation) {
      map.flyTo(userLocation, 12, { duration: 1.5 });
    }
  }, [selectedHospital, userLocation, routeGeometry, map]);

  return null;
}

export default function RoutingMap({
  hospitals,
  equityData,
  userLocation,
  selectedHospital,
  onSelectHospital,
  onRouteInfo,
}: Props) {
  const markerRefs = useRef<Record<number, L.Marker | null>>({});

  const [routeGeometry, setRouteGeometry] = useState<Array<[number, number]>>([]);
  const [fetchingRoute, setFetchingRoute] = useState(false);

  // Fetch real road navigation geometry from OSRM
  useEffect(() => {
    if (!selectedHospital) {
      setRouteGeometry([]);
      onRouteInfo?.(null);
      return;
    }

    const origin = userLocation || BANGLADESH_CENTER;
    const dest: [number, number] = [selectedHospital.lat, selectedHospital.lng];

    setFetchingRoute(true);

    // OSRM Driving Route API (lng,lat order for query)
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${origin[1]},${origin[0]};${dest[1]},${dest[0]}?overview=full&geometries=geojson`;

    fetch(osrmUrl)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          // Convert GeoJSON [lng, lat] to Leaflet [lat, lng]
          const coords: Array<[number, number]> = route.geometry.coordinates.map(
            ([lng, lat]: [number, number]) => [lat, lng]
          );
          setRouteGeometry(coords);

          const distanceKm = route.distance ? Number((route.distance / 1000).toFixed(1)) : 0;
          const durationMin = route.duration ? Math.round(route.duration / 60) : 0;
          onRouteInfo?.({ distanceKm, durationMin });
        } else {
          // Fallback to straight line
          setRouteGeometry([origin, dest]);
          onRouteInfo?.(null);
        }
      })
      .catch((err) => {
        console.error('OSRM route fetch failed, using straight line fallback:', err);
        setRouteGeometry([origin, dest]);
        onRouteInfo?.(null);
      })
      .finally(() => setFetchingRoute(false));
  }, [selectedHospital, userLocation]);

  useEffect(() => {
    if (selectedHospital && markerRefs.current[selectedHospital.id]) {
      markerRefs.current[selectedHospital.id]?.openPopup();
    }
  }, [selectedHospital]);

  return (
    <div className="glass-card overflow-hidden relative" style={{ height: 'calc(100vh - 180px)' }}>
      <MapContainer
        center={BANGLADESH_CENTER}
        zoom={BANGLADESH_ZOOM}
        className="w-full h-full"
        style={{ background: '#031c1c' }}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapController selectedHospital={selectedHospital} userLocation={userLocation} routeGeometry={routeGeometry} />

        {/* Equity Heatmap Circles */}
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

        {/* Real Road Route Line when a Hospital is Selected */}
        {selectedHospital && routeGeometry.length > 0 && (
          <>
            {/* Outer Red Glow Path */}
            <Polyline
              positions={routeGeometry}
              color="#ef4444"
              weight={7}
              opacity={0.45}
            />
            {/* Active Dashed Teal Emergency Road Line */}
            <Polyline
              positions={routeGeometry}
              color="#14b8a6"
              weight={4}
              dashArray="6, 8"
            />
          </>
        )}

        {/* Hospital Markers */}
        {hospitals.map((h) => {
          const isSelected = selectedHospital?.id === h.id;
          return (
            <Marker
              key={h.id}
              ref={(ref) => { markerRefs.current[h.id] = ref; }}
              position={[h.lat, h.lng]}
              icon={isSelected ? selectedHospitalIcon : hospitalIcon}
              eventHandlers={{
                click: () => onSelectHospital(h),
              }}
            >
              <Popup>
                <div className="text-xs space-y-1" style={{ minWidth: '200px' }}>
                  <p className="font-bold text-sm text-slate-900">{h.name}</p>
                  <p className="text-slate-600 font-medium">{h.district_name} • {h.type ? h.type.replace('_', ' ') : 'Medical Center'}</p>
                  <div className="pt-1 border-t border-gray-200">
                    <p className="text-slate-800">🛏️ <strong>{h.available_beds}</strong> / {h.total_beds} available beds</p>
                    {h.has_emergency && <p className="text-red-600 font-bold mt-0.5">🚨 24/7 Emergency Care</p>}
                    {h.phone && <p className="text-slate-700 font-mono mt-0.5">📞 {h.phone}</p>}
                  </div>

                  <button
                    onClick={() => onSelectHospital(h)}
                    className="w-full mt-2 py-1 px-2 rounded bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] transition-colors"
                  >
                    🗺️ Navigate & Draw Road Route
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* User Location Marker */}
        {userLocation && (
          <>
            <Marker position={userLocation} icon={userIcon}>
              <Popup>
                <div className="text-xs font-bold text-slate-900">📍 Your Current GPS Location</div>
              </Popup>
            </Marker>
            <CircleMarker center={userLocation} radius={35} fillColor="#3b82f6" fillOpacity={0.12} stroke={false} />
          </>
        )}
      </MapContainer>
    </div>
  );
}
