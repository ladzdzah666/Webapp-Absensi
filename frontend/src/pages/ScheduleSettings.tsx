import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import ScheduleSettingsForm from '../components/admin/schedule/ScheduleSettingsForm';
import { api } from '../services/api';
import { Clock, Moon, Sun, AlertTriangle } from 'lucide-react';

export default function ScheduleSettings() {
  const [scheduleSettings, setScheduleSettings] = useState({
    checkIn: { start: '', end: '' },
    checkOut: { start: '', end: '' }
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchSchedule = async () => {
    try {
      const data = await api.schedule.get();
      setScheduleSettings({
        checkIn: { 
          start: data.check_in_start || '00:00:00', 
          end: data.check_in_end || '00:00:00' 
        },
        checkOut: { 
          start: data.check_out_start || '00:00:00', 
          end: data.check_out_end || '00:00:00' 
        }
      });
    } catch (err: any) {
      setError(err.message || 'Gagal mengambil jadwal kerja');
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const handleScheduleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const validateTimeFormat = (time: string) => {
        return /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(time);
      };

      const { checkIn, checkOut } = scheduleSettings;

      const formatTime = (time: string) => {
        if (!time) return '00:00:00';
        const [hours, minutes] = time.split(':');
        return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
      };

      const formattedSchedule = {
        check_in_start: formatTime(checkIn.start),
        check_in_end: formatTime(checkIn.end),
        check_out_start: formatTime(checkOut.start),
        check_out_end: formatTime(checkOut.end)
      };

      if (!validateTimeFormat(formattedSchedule.check_in_start) || 
          !validateTimeFormat(formattedSchedule.check_in_end) ||
          !validateTimeFormat(formattedSchedule.check_out_start) || 
          !validateTimeFormat(formattedSchedule.check_out_end)) {
        throw new Error('Format waktu tidak valid (HH:mm:ss)');
      }

      await api.schedule.update(formattedSchedule);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan perubahan jadwal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Jadwal & Waktu Kerja">
      <div className="space-y-6">
        {/* Header Hero */}
        <div className="relative rounded-2xl glass-card overflow-hidden p-5 sm:p-7 border border-amber-500/20">
          <div className="absolute top-0 right-0 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 mb-2">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Ketentuan Waktu & Toleransi Presensi
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Pengaturan Jam Kerja Pegawai
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                Tentukan rentang jam presensi masuk dan presensi pulang. Pegawai yang melakukan presensi melewati batas jam masuk otomatis ditandai terlambat.
              </p>
            </div>

            {/* Quick overview pills */}
            <div className="flex items-center gap-3">
              <div className="px-4 py-3 rounded-xl bg-islamic-950/80 border border-amber-500/20 text-center">
                <span className="text-[10px] uppercase font-semibold text-amber-300/80 block">Jam Masuk</span>
                <span className="text-sm sm:text-base font-bold text-emerald-300">
                  {scheduleSettings.checkIn.start.slice(0, 5) || '--:--'} - {scheduleSettings.checkIn.end.slice(0, 5) || '--:--'}
                </span>
              </div>
              <div className="px-4 py-3 rounded-xl bg-islamic-950/80 border border-amber-500/20 text-center">
                <span className="text-[10px] uppercase font-semibold text-amber-300/80 block">Jam Pulang</span>
                <span className="text-sm sm:text-base font-bold text-amber-300">
                  {scheduleSettings.checkOut.start.slice(0, 5) || '--:--'} - {scheduleSettings.checkOut.end.slice(0, 5) || '--:--'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-sm flex items-center gap-3 animate-fade-in">
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Schedule Form */}
        <ScheduleSettingsForm
          scheduleSettings={scheduleSettings}
          setScheduleSettings={setScheduleSettings}
          handleScheduleUpdate={handleScheduleUpdate}
          error={error}
          success={success}
          loading={loading}
        />
      </div>
    </AdminLayout>
  );
}