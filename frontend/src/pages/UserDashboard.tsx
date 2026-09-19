import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Attendance, AttendanceSchedule } from '../types';
import UserLayout from '../components/user/UserLayout';
import LocationMap from '../components/user/LocationMap';
import LocationStatus from '../components/user/LocationStatus';
import TodayStatus from '../components/user/TodayStatus';
import { api } from '../services/api';
import { format, isToday, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import {
  AlertCircle, CheckCircle2, X, Info, Clock, Sparkles,
  MapPin, LogOut, Sun, Moon, AlertTriangle, ChevronDown, ChevronUp
} from 'lucide-react';

/**
 * UserDashboard: Mobile-first attendance dashboard.
 * Tombol Presensi langsung terlihat saat buka — prioritas utama.
 */
export default function UserDashboard() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [info, setInfo] = useState('');
  const [mapExpanded, setMapExpanded] = useState(false);

  // State Lokasi & Geofence
  const [currentLocation, setCurrentLocation] = useState<GeolocationPosition | null>(null);
  const [locationError, setLocationError] = useState<GeolocationPositionError | null>(null);
  const [officeLocation, setOfficeLocation] = useState({ lat: 0, lng: 0, radius: 100 });
  const [officeDistance, setOfficeDistance] = useState<number | null>(null);

  // Notifikasi toast
  const [activeNotification, setActiveNotification] = useState<{id: string; type: 'error' | 'success' | 'info'; message: string} | null>(null);
  const [notificationTimeout, setNotificationTimeout] = useState<NodeJS.Timeout | null>(null);

  const [scheduleTime, setScheduleTime] = useState<AttendanceSchedule | null>(null);

  useEffect(() => {
    fetchAttendance();
    startLocationTracking();
    fetchOfficeLocation();
    fetchSchedule();
  }, []);

  useEffect(() => {
    if (currentLocation && officeLocation.lat !== 0 && officeLocation.lng !== 0) {
      const distance = calculateDistance(
        { 
          latitude: currentLocation.coords.latitude, 
          longitude: currentLocation.coords.longitude 
        },
        { 
          latitude: officeLocation.lat, 
          longitude: officeLocation.lng 
        }
      );
      setOfficeDistance(distance);
    }
  }, [currentLocation, officeLocation]);

  useEffect(() => {
    if (error) {
      addNotification('error', error);
      setError('');
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      addNotification('success', success);
      setSuccess('');
    }
  }, [success]);

  useEffect(() => {
    if (info) {
      addNotification('info', info);
      setInfo('');
    }
  }, [info]);

  const addNotification = (type: 'error' | 'success' | 'info', message: string) => {
    if (notificationTimeout) {
      clearTimeout(notificationTimeout);
    }
    
    const id = Date.now().toString();
    setActiveNotification({ id, type, message });
    
    const timeout = setTimeout(() => {
      setActiveNotification(null);
    }, 3500);
    
    setNotificationTimeout(timeout);
  };

  const removeNotification = () => {
    setActiveNotification(null);
    if (notificationTimeout) {
      clearTimeout(notificationTimeout);
      setNotificationTimeout(null);
    }
  };

  const fetchAttendance = async () => {
    try {
      const data = await api.attendance.getUserAttendance();
      setAttendance(data);
      
      if (!hasCheckedInToday()) {
        const timeNow = format(new Date(), 'HH:mm');
        setInfo(`Assalamu'alaikum, ${user?.full_name || ''}! Waktu saat ini: ${timeNow} WIB`);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat catatan kehadiran');
    }
  };

  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      setError('Peramban Anda belum mendukung fitur geolokasi GPS.');
      return;
    }

    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'denied') {
          setError('Akses GPS ditolak. Mohon aktifkan izin lokasi di pengaturan browser.');
        }
      });
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 4000
    };

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentLocation(position);
        setLocationError(null);
      },
      (err) => {
        setLocationError(err);
        let message = 'Kendala GPS: ';
        switch(err.code) {
          case GeolocationPositionError.PERMISSION_DENIED:
            message += 'Izin akses lokasi tidak diberikan. Aktifkan izin lokasi Anda.';
            break;
          case GeolocationPositionError.POSITION_UNAVAILABLE:
            message += 'Sinyal GPS tidak terdeteksi. Pastikan Anda berada di area terbuka.';
            break;
          case GeolocationPositionError.TIMEOUT:
            message += 'Waktu pencarian sinyal GPS habis. Coba segarkan halaman.';
            break;
          default:
            message += err.message;
        }
        setError(message);
      },
      options
    );

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  };

  const fetchOfficeLocation = async () => {
    try {
      const data = await api.location.get();
      setOfficeLocation(data);
    } catch (err: any) {
      setError(err.message || 'Gagal mengambil data lokasi kantor');
    }
  };

  const fetchSchedule = async () => {
    try {
      const data = await api.schedule.get();
      setScheduleTime(data);
    } catch (err: any) {
      setError(err.message || 'Gagal mengambil jadwal kerja');
    }
  };

  const calculateDistance = (point1: { latitude: number; longitude: number }, point2: { latitude: number; longitude: number }): number => {
    const R = 6371e3; // Radius bumi meter
    const φ1 = toRadians(point1.latitude);
    const φ2 = toRadians(point2.latitude);
    const Δφ = toRadians(point2.latitude - point1.latitude);
    const Δλ = toRadians(point2.longitude - point1.longitude);

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  const toRadians = (degrees: number): number => {
    return degrees * (Math.PI / 180);
  };

  const isWithinOfficeRadius = (): boolean => {
    if (!currentLocation || officeLocation.lat === 0 || officeLocation.lng === 0 || !officeDistance) {
      return false;
    }
    return officeDistance <= officeLocation.radius;
  };

  const getTodayRecord = () => {
    return attendance.find((record) => {
      if (!record.check_in_time) return false;
      try {
        return isToday(parseISO(record.check_in_time));
      } catch {
        return false;
      }
    });
  };

  const hasCheckedInToday = (): boolean => {
    return !!getTodayRecord();
  };
  
  const canCheckIn = (): boolean => {
    return !getTodayRecord();
  };

  const canCheckOut = (): boolean => {
    const todayRecord = getTodayRecord();
    return !!todayRecord && !todayRecord.check_out_time;
  };

  const handleCheckIn = async () => {
    if (!currentLocation) {
      setError('Titik lokasi GPS belum terhubung. Mohon aktifkan GPS pada ponsel Anda.');
      return;
    }
    
    if (!isWithinOfficeRadius()) {
      setError('Anda berada di luar area kantor. Presensi hanya dapat dilakukan di dalam radius kantor.');
      return;
    }
    
    setLoading(true);
    try {
      await api.attendance.checkIn(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude
      );
      await fetchAttendance();
      setSuccess(`Alhamdulillah! Presensi masuk berhasil dicatat pada ${format(new Date(), 'HH:mm')} WIB. Selamat bertugas dengan penuh berkah.`);
    } catch (err: any) {
      setError(err.message || 'Gagal mencatat presensi masuk');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!currentLocation) {
      setError('Titik lokasi GPS belum terhubung. Mohon aktifkan GPS pada ponsel Anda.');
      return;
    }
    
    if (!isWithinOfficeRadius()) {
      setError('Anda berada di luar area kantor. Presensi hanya dapat dilakukan di dalam radius kantor.');
      return;
    }
    
    setLoading(true);
    try {
      await api.attendance.checkOut(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude
      );
      await fetchAttendance();
      setSuccess(`Alhamdulillah! Presensi pulang berhasil dicatat pada ${format(new Date(), 'HH:mm')} WIB. Terima kasih atas dedikasi dan kerja keras Anda hari ini.`);
    } catch (err: any) {
      setError(err.message || 'Gagal mencatat presensi pulang');
    } finally {
      setLoading(false);
    }
  };

  // --- Derived state for UI ---
  const isInsideRadius = isWithinOfficeRadius();
  const isGpsReady = !!currentLocation && !locationError;
  const todayDone = hasCheckedInToday() && !canCheckOut();
  const checkInDisabled = !isGpsReady || !isInsideRadius || loading || !canCheckIn();
  const checkOutDisabled = !isGpsReady || !isInsideRadius || loading || !canCheckOut();

  const gpsStatusColor = !isGpsReady
    ? 'text-amber-400'
    : isInsideRadius
    ? 'text-emerald-400'
    : 'text-rose-400';

  const gpsStatusText = locationError
    ? 'GPS Error'
    : !currentLocation
    ? 'Mencari GPS...'
    : isInsideRadius
    ? 'Dalam Radius Kantor'
    : 'Di Luar Radius';

  return (
    <UserLayout>
      {/* Notifikasi Toast — di paling atas layar */}
      {activeNotification && (
        <div className="fixed inset-x-0 top-4 flex justify-center z-[9999] px-4 pointer-events-none">
          <div
            className={`max-w-sm w-full p-3.5 rounded-2xl shadow-2xl flex items-start gap-3 pointer-events-auto border backdrop-blur-md animate-fade-in ${
              activeNotification.type === 'error'
                ? 'bg-rose-950/95 border-rose-500/50 text-rose-100'
                : activeNotification.type === 'success'
                ? 'bg-emerald-950/95 border-emerald-400/50 text-emerald-100'
                : 'bg-islamic-900/98 border-amber-500/50 text-amber-100'
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {activeNotification.type === 'error' ? (
                <AlertCircle className="h-5 w-5 text-rose-400" />
              ) : activeNotification.type === 'success' ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              ) : (
                <Info className="h-5 w-5 text-amber-400" />
              )}
            </div>
            <p className="text-xs sm:text-sm font-semibold leading-5 flex-1">{activeNotification.message}</p>
            <button onClick={removeNotification} className="text-slate-400 hover:text-white flex-shrink-0">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-lg mx-auto lg:max-w-7xl space-y-3 sm:space-y-4 pb-8">

        {/* ── HEADER KOMPAK ── */}

        <div className="glass-card rounded-2xl px-4 py-3 border border-amber-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-[10px] text-emerald-300 font-semibold tracking-wider uppercase mb-0.5">Assalamu'alaikum ✨</p>
              <h1 className="text-sm sm:text-base font-extrabold text-white leading-tight">{user?.full_name || 'Pegawai'}</h1>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {format(new Date(), "EEEE, dd MMM yyyy", { locale: localeId })}
              </p>
            </div>
            <div className="text-right">
              <div className={`text-[10px] font-bold flex items-center gap-1 justify-end ${gpsStatusColor}`}>
                <span className={`w-1.5 h-1.5 rounded-full inline-block ${
                  !isGpsReady ? 'bg-amber-400 animate-pulse' : isInsideRadius ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                }`} />
                {gpsStatusText}
              </div>
              {officeDistance !== null && (
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Jarak: <strong className={isInsideRadius ? 'text-emerald-300' : 'text-rose-300'}>
                    {officeDistance > 1000 ? `${(officeDistance/1000).toFixed(1)}km` : `${Math.round(officeDistance)}m`}
                  </strong>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── LAYOUT UTAMA ── */}
        <div className="lg:grid lg:grid-cols-3 lg:gap-6 space-y-3 lg:space-y-0">

          {/* KOLOM KIRI — PRIORITAS MOBILE */}
          <div className="lg:col-span-2 space-y-3">

            {/* ═══════════════════════════════════════
                TOMBOL PRESENSI — TAMPIL PALING ATAS
            ═══════════════════════════════════════ */}
            <div className="glass-card rounded-2xl overflow-hidden border border-amber-500/30">
              <div className="px-4 py-2.5 border-b border-amber-500/15 bg-islamic-950/60 flex items-center justify-between">
                <h2 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Presensi Hari Ini
                </h2>
                {scheduleTime && (
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <Sun className="w-3 h-3 text-amber-400" />
                    <span>{scheduleTime.check_in_start.slice(0,5)}</span>
                    <span>–</span>
                    <Moon className="w-3 h-3 text-emerald-400" />
                    <span>{scheduleTime.check_out_end.slice(0,5)}</span>
                  </div>
                )}
              </div>

              <div className="p-3 sm:p-4 space-y-3">
                {/* Status Info */}
                {todayDone && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    Alhamdulillah! Presensi hari ini telah selesai.
                  </div>
                )}
                {!isGpsReady && !todayDone && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
                    <Clock className="w-4 h-4 animate-spin shrink-0" />
                    Menghubungkan GPS... Harap tunggu.
                  </div>
                )}
                {isGpsReady && !isInsideRadius && !todayDone && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    Di luar area kantor — dekati kantor untuk presensi.
                  </div>
                )}
                {isGpsReady && isInsideRadius && !todayDone && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-medium">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    Dalam area kantor — siap untuk presensi!
                  </div>
                )}

                {/* ─── TOMBOL UTAMA BESAR ─── */}
                <div className="grid grid-cols-2 gap-3">
                  {/* ABSEN MASUK */}
                  <button
                    onClick={handleCheckIn}
                    disabled={checkInDisabled}
                    id="btn-check-in"
                    className={`relative group overflow-hidden rounded-2xl font-bold transition-all duration-300 active:scale-[0.96] focus:outline-none focus:ring-2 focus:ring-emerald-400/50
                      flex flex-col items-center justify-center gap-1.5 py-5 sm:py-6 px-3
                      ${ !checkInDisabled
                        ? 'bg-gradient-to-b from-emerald-600 to-emerald-800 text-white shadow-lg shadow-emerald-950/60 hover:from-emerald-500 hover:to-emerald-700 border border-amber-400/30'
                        : 'bg-islamic-950/70 text-slate-600 border border-slate-800/80 cursor-not-allowed'
                      }`}
                  >
                    {!checkInDisabled && (
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    )}
                    {!checkInDisabled && (
                      <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400" />
                      </span>
                    )}
                    <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-0.5 ${
                      !checkInDisabled ? 'bg-white/15' : 'bg-slate-800/50'
                    }`}>
                      <CheckCircle2 className={`w-5 h-5 sm:w-6 sm:h-6 ${loading && !checkInDisabled ? 'animate-spin' : ''} ${!checkInDisabled ? 'text-amber-300' : 'text-slate-600'}`} />
                    </div>
                    <span className="text-sm sm:text-base font-extrabold tracking-wide">
                      {hasCheckedInToday() ? 'Sudah Masuk' : 'Absen Masuk'}
                    </span>
                    <span className={`text-[10px] sm:text-[11px] font-normal ${!checkInDisabled ? 'text-emerald-200/80' : 'text-slate-600'}`}>
                      {!hasCheckedInToday() ? 'Bismillah • Awali Hari' : '✓ Tercatat'}
                    </span>
                  </button>

                  {/* ABSEN PULANG */}
                  <button
                    onClick={handleCheckOut}
                    disabled={checkOutDisabled}
                    id="btn-check-out"
                    className={`relative group overflow-hidden rounded-2xl font-bold transition-all duration-300 active:scale-[0.96] focus:outline-none focus:ring-2 focus:ring-amber-400/50
                      flex flex-col items-center justify-center gap-1.5 py-5 sm:py-6 px-3
                      ${ !checkOutDisabled
                        ? 'bg-gradient-to-b from-amber-500 to-amber-700 text-slate-950 shadow-lg shadow-amber-950/60 hover:from-amber-400 hover:to-amber-600 border border-amber-300/50'
                        : 'bg-islamic-950/70 text-slate-600 border border-slate-800/80 cursor-not-allowed'
                      }`}
                  >
                    {!checkOutDisabled && (
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    )}
                    {!checkOutDisabled && (
                      <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
                      </span>
                    )}
                    <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-0.5 ${
                      !checkOutDisabled ? 'bg-black/15' : 'bg-slate-800/50'
                    }`}>
                      <LogOut className={`w-5 h-5 sm:w-6 sm:h-6 ${loading && !checkOutDisabled ? 'animate-spin' : ''} ${!checkOutDisabled ? 'text-slate-950' : 'text-slate-600'}`} />
                    </div>
                    <span className="text-sm sm:text-base font-extrabold tracking-wide">Absen Pulang</span>
                    <span className={`text-[10px] sm:text-[11px] font-normal ${!checkOutDisabled ? 'text-amber-900' : 'text-slate-600'}`}>
                      {!checkOutDisabled ? 'Alhamdulillah • Selesai' : 'Belum Tersedia'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* ── PETA LOKASI (Collapsible di mobile) ── */}
            <div className="glass-card rounded-2xl overflow-hidden border border-amber-500/20">
              <button
                onClick={() => setMapExpanded(!mapExpanded)}
                className="w-full px-4 py-3 border-b border-amber-500/15 bg-islamic-950/60 flex items-center justify-between"
              >
                <h2 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  Peta Lokasi Presensi
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold ml-1">
                    Radius {officeLocation.radius}m
                  </span>
                </h2>
                <span className="lg:hidden text-slate-400">
                  {mapExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              </button>

              {/* Di mobile: collapsed by default; di desktop: selalu tampil */}
              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                mapExpanded ? 'max-h-[500px]' : 'max-h-0 lg:max-h-[500px]'
              }`}>
                <div className="p-3 space-y-2">
                  <LocationMap currentLocation={currentLocation} officeLocation={officeLocation} />
                  <LocationStatus
                    currentLocation={currentLocation}
                    isWithinOfficeRadius={isWithinOfficeRadius}
                    locationError={locationError}
                    officeDistance={officeDistance}
                  />
                </div>
              </div>

              {!mapExpanded && (
                <div className="lg:hidden px-4 py-2.5 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
                  <MapPin className="w-3 h-3 text-amber-500" />
                  Ketuk untuk melihat peta lokasi GPS
                </div>
              )}
            </div>
          </div>

          {/* ── KOLOM KANAN (Sidebar Desktop) ── */}
          <div className="lg:col-span-1 space-y-3">
            <TodayStatus attendance={attendance} />

            {scheduleTime && (
              <div className="glass-card rounded-2xl p-4 border border-amber-500/20">
                <h3 className="text-xs font-bold text-amber-300 mb-3 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />Jadwal Kerja Hari Ini
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-400"><Sun className="w-3.5 h-3.5 text-amber-400" />Jam Masuk</div>
                    <span className="font-bold text-amber-200">{scheduleTime.check_in_start.slice(0,5)} – {scheduleTime.check_in_end.slice(0,5)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-400"><Moon className="w-3.5 h-3.5 text-emerald-400" />Jam Pulang</div>
                    <span className="font-bold text-emerald-200">{scheduleTime.check_out_start.slice(0,5)} – {scheduleTime.check_out_end.slice(0,5)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="glass-card rounded-2xl p-4 border border-amber-500/20">
              <h3 className="text-xs font-bold text-amber-300 mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />Tata Cara Presensi
              </h3>
              <ul className="space-y-2 text-[11px] text-slate-300 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold shrink-0">①</span>
                  <span>Aktifkan GPS dengan mode <strong>Akurasi Tinggi</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold shrink-0">②</span>
                  <span>Pastikan dalam radius <strong className="text-amber-300">{officeLocation.radius}m</strong> dari kantor.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold shrink-0">③</span>
                  <span>Tekan <strong>Absen Masuk</strong> dan <strong>Absen Pulang</strong>.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}