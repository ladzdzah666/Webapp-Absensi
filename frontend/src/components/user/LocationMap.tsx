import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation } from 'lucide-react';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Marker pengguna hijau zamrud
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Marker kantor emas islami
const officeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const LocationMarker: React.FC<{ 
  position: [number, number]; 
  icon: L.Icon;
  popupContent?: React.ReactNode;
}> = ({ position, icon, popupContent }) => {
  return (
    <Marker position={position} icon={icon}>
      {popupContent && <Popup>{popupContent}</Popup>}
    </Marker>
  );
};

const MapCenterer: React.FC<{ position: [number, number] }> = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position, map]);
  return null;
};

interface LocationMapProps {
  currentLocation: GeolocationPosition | null;
  officeLocation: {
    lat: number;
    lng: number;
    radius: number;
  };
}

const LocationGuide: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-full bg-islamic-950/90 text-amber-100 p-4">
      <div className="text-center max-w-sm">
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto mb-2 text-amber-400">
          <MapPin className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-bold text-amber-300 mb-1">Mencari Sinyal Lokasi GPS...</h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Mohon pastikan GPS perangkat aktif dan izin lokasi telah disetujui pada peramban Anda.
        </p>
      </div>
    </div>
  );
};

const LocationMap: React.FC<LocationMapProps> = ({ currentLocation, officeLocation }) => {
  const userPosition: [number, number] | null = currentLocation 
    ? [currentLocation.coords.latitude, currentLocation.coords.longitude] 
    : null;
  
  const officePosition: [number, number] = [officeLocation.lat, officeLocation.lng];
  const showOfficeLocation = officeLocation.lat !== 0 && officeLocation.lng !== 0;
  
  const mapCenter = userPosition || (showOfficeLocation ? officePosition : [0, 0]);
  const mapZoom = userPosition || showOfficeLocation ? 16 : 2;
  
  return (
    <div className="h-[220px] xs:h-[250px] sm:h-[320px] rounded-2xl overflow-hidden touch-manipulation border border-amber-500/25 shadow-glass relative group">
      {/* Golden trim frame */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none border border-amber-400/20 z-20 group-hover:border-amber-400/40 transition-colors" />
      
      {userPosition || showOfficeLocation ? (
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%', position: 'relative', zIndex: 1 }}
          scrollWheelZoom={false}
          zoomControl={true}
          dragging={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          
          {userPosition && <MapCenterer position={userPosition} />}
          
          {userPosition && (
            <LocationMarker 
              position={userPosition} 
              icon={userIcon}
              popupContent={
                <div className="p-1 text-center">
                  <h4 className="font-bold text-emerald-400 text-xs mb-0.5">📍 Posisi Anda Saat Ini</h4>
                  <p className="text-[11px] text-slate-200 font-mono">
                    {userPosition[0].toFixed(5)}, {userPosition[1].toFixed(5)}
                  </p>
                </div>
              }
            />
          )}
          
          {showOfficeLocation && (
            <>
              <LocationMarker 
                position={officePosition} 
                icon={officeIcon}
                popupContent={
                  <div className="p-1 text-center">
                    <h4 className="font-bold text-amber-400 text-xs mb-0.5">🕌 Titik Pusat Kantor</h4>
                    <p className="text-[11px] text-slate-200">
                      Radius Presensi: <strong className="text-amber-300">{officeLocation.radius} meter</strong>
                    </p>
                  </div>
                }
              />
              <Circle 
                center={officePosition}
                radius={officeLocation.radius}
                pathOptions={{ 
                  color: '#d4af37',
                  fillColor: '#10b981',
                  fillOpacity: 0.22,
                  weight: 2,
                  dashArray: '5, 8'
                }}
              />
            </>
          )}
        </MapContainer>
      ) : (
        <LocationGuide />
      )}
    </div>
  );
};

export default LocationMap;