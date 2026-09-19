import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import { LocationSettingsForm } from '../components/admin/location/LocationSettingsForm';
import { api } from '../services/api';
import { MapPin, Navigation, Moon } from 'lucide-react';

export default function LocationSettings() {
  const [locationSettings, setLocationSettings] = useState({
    latitude: 0,
    longitude: 0,
    radius: 100
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchOfficeLocation = async () => {
    try {
      const data = await api.location.get();
      setLocationSettings({
        latitude: Number(data.lat),
        longitude: Number(data.lng),
        radius: Number(data.radius)
      });
    } catch (err: any) {
      setError(err.message || 'Gagal memuat konfigurasi lokasi');
    }
  };

  useEffect(() => {
    fetchOfficeLocation();
  }, []);

  const handleLocationUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.location.update(
        locationSettings.latitude,
        locationSettings.longitude,
        locationSettings.radius
      );
      setSuccess('Alhamdulillah! Titik koordinat dan radius presensi kantor berhasil diperbarui.');
    } catch (err: any) {
      setError(err.message || 'Gagal memperbarui lokasi kantor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Titik Lokasi & Radius Kantor">
      <div className="space-y-6">
        {/* Header Hero */}
        <div className="relative rounded-2xl glass-card overflow-hidden p-5 sm:p-7 border border-amber-500/20">
          <div className="absolute top-0 right-0 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 mb-2">
                <Moon className="w-3.5 h-3.5 text-amber-400" />
                Konfigurasi Geofence Kantor
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Pengaturan Titik Pusat Lokasi Kantor
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                Tentukan koordinat pusat presensi dan toleransi radius (geofence). Pegawai hanya dapat melakukan presensi jika berada di dalam batas radius ini.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <div className="px-4 py-3 rounded-xl bg-islamic-950/80 border border-amber-500/20 text-center">
                <span className="text-[10px] uppercase font-semibold text-amber-300/80 block">Radius Aktif</span>
                <span className="text-lg font-bold text-amber-400">{locationSettings.radius} meter</span>
              </div>
            </div>
          </div>
        </div>

        <LocationSettingsForm
          locationSettings={locationSettings}
          setLocationSettings={setLocationSettings}
          handleLocationUpdate={handleLocationUpdate}
          error={error}
          success={success}
          loading={loading}
        />
      </div>
    </AdminLayout>
  );
}