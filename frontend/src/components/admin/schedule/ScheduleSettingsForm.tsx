import React from 'react';
import { Clock, AlertTriangle, CheckCircle2, Save, Sun, Moon, Loader2 } from 'lucide-react';

interface ScheduleSettingsFormProps {
  scheduleSettings: {
    checkIn: {
      start: string;
      end: string;
    };
    checkOut: {
      start: string;
      end: string;
    };
  };
  setScheduleSettings: React.Dispatch<React.SetStateAction<{
    checkIn: { start: string; end: string };
    checkOut: { start: string; end: string };
  }>>;
  handleScheduleUpdate: (e: React.FormEvent) => void;
  error: string;
  success: boolean;
  loading: boolean;
}

const ScheduleSettingsForm: React.FC<ScheduleSettingsFormProps> = ({
  scheduleSettings,
  setScheduleSettings,
  handleScheduleUpdate,
  error,
  success,
  loading,
}) => {
  const handleTimeChange = (type: 'checkInStart' | 'checkInEnd' | 'checkOutStart' | 'checkOutEnd', value: string) => {
    if (!value) return;
    const parts = value.split(':');
    const h = parts[0].padStart(2, '0');
    const m = (parts[1] || '00').padStart(2, '0');
    const formattedTime = `${h}:${m}:00`;

    setScheduleSettings((prev: any) => ({
      ...prev,
      [type.includes('checkIn') ? 'checkIn' : 'checkOut']: {
        ...prev[type.includes('checkIn') ? 'checkIn' : 'checkOut'],
        [type.endsWith('Start') ? 'start' : 'end']: formattedTime,
      },
    }));
  };

  const formatTimeForDisplay = (time: string) => {
    return time ? time.slice(0, 5) : '';
  };

  return (
    <form onSubmit={handleScheduleUpdate} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Kartu Jam Masuk (Sun / Pagi) */}
        <div className="rounded-2xl glass-card p-5 sm:p-6 border border-emerald-500/20 relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
              <Sun className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">Jadwal Masuk (Pagi)</h3>
              <p className="text-xs text-slate-300">Waktu dibukanya dan batas akhir presensi masuk</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-amber-200 uppercase tracking-wider mb-2">
                Waktu Mulai Presensi Masuk
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={formatTimeForDisplay(scheduleSettings.checkIn.start)}
                  onChange={(e) => handleTimeChange('checkInStart', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass-input text-base font-semibold focus:outline-none focus:border-amber-500 transition-all"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Presensi belum dapat dilakukan sebelum jam ini.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-200 uppercase tracking-wider mb-2">
                Batas Jam Masuk (Toleransi)
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={formatTimeForDisplay(scheduleSettings.checkIn.end)}
                  onChange={(e) => handleTimeChange('checkInEnd', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass-input text-base font-semibold focus:outline-none focus:border-amber-500 transition-all"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Presensi melewati jam ini otomatis ditandai Terlambat.</p>
            </div>
          </div>
        </div>

        {/* Kartu Jam Pulang (Moon / Sore) */}
        <div className="rounded-2xl glass-card p-5 sm:p-6 border border-amber-500/20 relative overflow-hidden group hover:border-amber-500/40 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300">
              <Moon className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">Jadwal Pulang (Sore)</h3>
              <p className="text-xs text-slate-300">Waktu dibukanya dan batas akhir presensi pulang</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-amber-200 uppercase tracking-wider mb-2">
                Waktu Mulai Presensi Pulang
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={formatTimeForDisplay(scheduleSettings.checkOut.start)}
                  onChange={(e) => handleTimeChange('checkOutStart', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass-input text-base font-semibold focus:outline-none focus:border-amber-500 transition-all"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Tombol presensi pulang baru aktif setelah jam ini tercapai.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-200 uppercase tracking-wider mb-2">
                Batas Akhir Presensi Pulang
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={formatTimeForDisplay(scheduleSettings.checkOut.end)}
                  onChange={(e) => handleTimeChange('checkOutEnd', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass-input text-base font-semibold focus:outline-none focus:border-amber-500 transition-all"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Batas akhir pegawai dapat mencatatkan kepulangan harian.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notifikasi */}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-sm flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>Alhamdulillah! Pengaturan jam kerja presensi berhasil disimpan.</span>
        </div>
      )}

      {/* Tombol Simpan */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:from-amber-300 hover:to-yellow-400 shadow-lg shadow-amber-950/50 active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Menyimpan Jadwal...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Simpan Ketentuan Jam Kerja</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ScheduleSettingsForm;