import React from 'react';
import { Clock, LogIn, LogOut, Timer, CalendarCheck } from 'lucide-react';
import { isToday, parseISO, differenceInMinutes } from 'date-fns';
import { Attendance } from '../../types';

interface TodayStatusProps {
  attendance: Attendance[];
}

const TodayStatus: React.FC<TodayStatusProps> = ({ attendance }) => {
  const todayAttendance = attendance.find((record) => {
    if (!record.check_in_time) return false;
    try {
      return isToday(parseISO(record.check_in_time));
    } catch {
      return false;
    }
  });

  const getWorkDuration = () => {
    if (!todayAttendance?.check_in_time || !todayAttendance?.check_out_time) return null;
    try {
      const minutes = differenceInMinutes(
        parseISO(todayAttendance.check_out_time),
        parseISO(todayAttendance.check_in_time)
      );
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours} jam ${mins} menit`;
    } catch {
      return null;
    }
  };

  const workDuration = getWorkDuration();

  return (
    <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-amber-500/20 shadow-glass">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-amber-500/15">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">Catatan Presensi Hari Ini</h3>
            <p className="text-xs text-slate-300">Rekapitulasi jam kerja Anda</p>
          </div>
        </div>

        {todayAttendance && (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Hadir
          </span>
        )}
      </div>

      {todayAttendance ? (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Waktu Presensi Masuk */}
            <div className="glass-panel p-3 rounded-xl border border-amber-500/10 hover:border-emerald-500/30 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <LogIn className="w-3.5 h-3.5" />
                </div>
                <p className="text-[11px] font-medium text-slate-400">Waktu Masuk</p>
              </div>
              <p className="text-base font-bold text-white font-mono leading-tight">
                {new Date(todayAttendance.check_in_time!).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </p>
              <p className="text-[10px] text-slate-400 mb-2">WIB</p>
              <span className="inline-block text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/25">
                ✓ Tercatat
              </span>
            </div>

            {/* Waktu Presensi Pulang */}
            <div className="glass-panel p-3 rounded-xl border border-amber-500/10 hover:border-amber-500/30 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <LogOut className="w-3.5 h-3.5" />
                </div>
                <p className="text-[11px] font-medium text-slate-400">Waktu Pulang</p>
              </div>
              {todayAttendance.check_out_time ? (
                <>
                  <p className="text-base font-bold text-white font-mono leading-tight">
                    {new Date(todayAttendance.check_out_time).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </p>
                  <p className="text-[10px] text-slate-400 mb-2">WIB</p>
                  <span className="inline-block text-[10px] px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/25">
                    ✓ Selesai
                  </span>
                </>
              ) : (
                <>
                  <p className="text-base font-bold text-slate-500 leading-tight">–</p>
                  <p className="text-[11px] text-slate-500 mb-2">Belum presensi pulang</p>
                  <span className="inline-block text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-500 font-semibold border border-slate-700">
                    Menunggu
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Durasi Kerja */}
          {workDuration && (
            <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/60 to-amber-950/40 border border-amber-500/25 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-amber-200 font-medium">
                <Timer className="w-4 h-4 text-amber-400" />
                <span>Total Durasi Kerja Hari Ini:</span>
              </div>
              <span className="text-xs sm:text-sm font-bold text-white font-mono">{workDuration}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="py-7 px-4 text-center glass-panel rounded-2xl border border-dashed border-amber-500/20">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center mx-auto mb-2 text-amber-400">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <h4 className="text-sm font-semibold text-slate-200">Belum Ada Presensi Masuk Hari Ini</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Silakan aktifkan GPS dan tekan tombol Presensi Masuk saat berada di area kantor.
          </p>
        </div>
      )}
    </div>
  );
};

export default TodayStatus;