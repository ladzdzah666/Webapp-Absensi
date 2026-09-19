import React, { useState } from 'react';
import { MapPin, Save, CheckCircle2, AlertTriangle, Compass, Loader2 } from 'lucide-react';
import { MapContainer, TileLayer, Circle, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const customIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function LocationMarker({ position, setPosition }: { position: [number, number]; setPosition: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
    },
  });

  return (
    <Marker
      position={position}
      icon={customIcon}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const pos = marker.getLatLng();
          setPosition([pos.lat, pos.lng]);
        },
      }}
    />
  );
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  React.useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

interface LocationSettingsFormProps {
  locationSettings: { latitude: number; longitude: number; radius: number };
  setLocationSettings: React.Dispatch<React.SetStateAction<{ latitude: number; longitude: number; radius: number }>>;
  handleLocationUpdate: (e: React.FormEvent) => void;
  error: string;
  success: string;
  loading: boolean;
}

export const LocationSettingsForm: React.FC<LocationSettingsFormProps> = ({
  locationSettings,
  setLocationSettings,
  handleLocationUpdate,
  error,
  success,
  loading,
}) => {
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');

  const getCurrentLocation = () => {
    setGettingLocation(true);
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError('Geolokasi tidak didukung oleh peramban ini');
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocationSettings(prev => ({
          ...prev,
          latitude,
          longitude
        }));
        setGettingLocation(false);
      },
      (err) => {
        let errMsg = 'Gagal mengambil koordinat saat ini';
        if (err.code === err.PERMISSION_DENIED) {
          errMsg = 'Izin akses lokasi ditolak. Aktifkan izin lokasi pada browser.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          errMsg = 'Informasi sinyal GPS lokasi tidak tersedia.';
        } else if (err.code === err.TIMEOUT) {
          errMsg = 'Waktu permintaan lokasi GPS habis.';
        }
        setLocationError(errMsg);
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const setRadiusPreset = (val: number) => {
    setLocationSettings(prev => ({ ...prev, radius: val }));
  };

  return (
    <div className="space-y-6">
      {/* Tips Bar */}
      <div className="rounded-2xl glass-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-amber-500/20">
        <div className="flex items-center gap-3 text-slate-300 text-xs sm:text-sm">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <span>Geser pin penanda emas pada peta atau klik langsung untuk memposisikan titik pusat kantor.</span>
        </div>

        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={gettingLocation}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-amber-300 bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 active:scale-95 transition-all disabled:opacity-50"
        >
          {gettingLocation ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Mencari Sinyal GPS...</span>
            </>
          ) : (
            <>
              <Compass className="w-3.5 h-3.5" />
              <span>Gunakan Lokasi Perangkat Ini</span>
            </>
          )}
        </button>
      </div>

      {locationError && (
        <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs sm:text-sm flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{locationError}</span>
        </div>
      )}

      {/* Main Settings Card */}
      <div className="rounded-2xl glass-card overflow-hidden p-4 sm:p-6 border border-amber-500/20">
        <form onSubmit={handleLocationUpdate} className="space-y-6">
          {/* Coordinates & Radius Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-amber-200 uppercase tracking-wider mb-2">
                Latitude (Garis Lintang)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  value={locationSettings.latitude || ''}
                  onChange={(e) => setLocationSettings({ ...locationSettings, latitude: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm focus:outline-none focus:border-amber-500 transition-all font-mono"
                  placeholder="-6.200000"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-amber-300/70 font-mono">°N/S</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-200 uppercase tracking-wider mb-2">
                Longitude (Garis Bujur)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  value={locationSettings.longitude || ''}
                  onChange={(e) => setLocationSettings({ ...locationSettings, longitude: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm focus:outline-none focus:border-amber-500 transition-all font-mono"
                  placeholder="106.816666"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-amber-300/70 font-mono">°E/W</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-amber-200 uppercase tracking-wider">
                  Radius Geofence
                </label>
                <div className="flex gap-1">
                  {[50, 100, 200, 500].map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRadiusPreset(r)}
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        locationSettings.radius === r
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-islamic-950 text-slate-400 hover:text-white border border-amber-500/20'
                      }`}
                    >
                      {r}m
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={locationSettings.radius || ''}
                  onChange={(e) => setLocationSettings({ ...locationSettings, radius: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm focus:outline-none focus:border-amber-500 transition-all font-mono"
                  placeholder="100"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-amber-300 font-medium">Meter</span>
              </div>
            </div>
          </div>

          {/* Interactive Map */}
          <div className="relative h-[280px] sm:h-[400px] rounded-2xl overflow-hidden border border-amber-500/25 shadow-xl">
            {locationSettings.latitude !== 0 && locationSettings.longitude !== 0 ? (
              <MapContainer
                center={[locationSettings.latitude, locationSettings.longitude]}
                zoom={16}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <LocationMarker
                  position={[locationSettings.latitude, locationSettings.longitude]}
                  setPosition={(pos: [number, number]) => setLocationSettings(prev => ({ ...prev, latitude: pos[0], longitude: pos[1] }))}
                />
                <MapUpdater center={[locationSettings.latitude, locationSettings.longitude]} />
                <Circle
                  center={[locationSettings.latitude, locationSettings.longitude]}
                  radius={locationSettings.radius > 0 ? locationSettings.radius : 100}
                  pathOptions={{ color: '#d4af37', fillColor: '#10b981', fillOpacity: 0.25, weight: 2 }}
                />
              </MapContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-amber-200 bg-islamic-950">
                <Compass className="w-8 h-8 text-amber-400 mb-2 animate-spin" />
                <p className="text-sm">Menyiapkan peta geofence kantor...</p>
              </div>
            )}
          </div>

          {/* Notifications */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-sm flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-sm flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="font-bold">{success}</p>
                <p className="text-xs text-emerald-300/80 mt-0.5">
                  Latitude: {locationSettings.latitude.toFixed(6)}°, Longitude: {locationSettings.longitude.toFixed(6)}°, Radius: {locationSettings.radius} meter
                </p>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:from-amber-300 hover:to-yellow-400 shadow-lg shadow-amber-950/50 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan Titik Lokasi...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan Titik Kantor</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};