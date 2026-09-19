import React from 'react';
import { CheckCircle2, LogOut, Clock, AlertCircle, Sparkles, Moon, Sun } from 'lucide-react';
import { AttendanceSchedule } from '../../types';

interface AttendanceButtonsProps {
  canCheckIn: boolean;
  canCheckOut: boolean;
  handleCheckIn: () => void;
  handleCheckOut: () => void;
  loading: boolean;
  isWithinOfficeRadius: () => boolean;
  isWithinCheckInTime: () => boolean;
  isWithinCheckOutTime: () => boolean;
  currentLocation: GeolocationPosition | null;
  scheduleTime?: AttendanceSchedule;
  hasCheckedInToday: boolean;
}

const AttendanceButtons: React.FC<AttendanceButtonsProps> = ({
  canCheckIn,
  canCheckOut,
  handleCheckIn,
  handleCheckOut,
  loading,
  isWithinOfficeRadius,
  currentLocation,
  scheduleTime,
  hasCheckedInToday
}) => {
  const getButtonMessage = () => {
    if (!currentLocation) {
      return {
        text: "Menghubungkan sensor GPS perangkat...",
        icon: <Clock className="w-4 h-4 text-amber-400 animate-spin" />,
        bg: "bg-amber-500/15 border-amber-500/30 text-amber-300"
      };
    }
    
    if (!isWithinOfficeRadius()) {
      return {
        text: "Anda berada di luar area radius kantor yang telah ditentukan",
        icon: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
        bg: "bg-rose-500/15 border-rose-500/30 text-rose-300"
      };
    }

    if (hasCheckedInToday && !canCheckOut) {
      return {
        text: "Alhamdulillah! Anda telah menyelesaikan presensi hari ini",
        icon: <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />,
        bg: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
      };
    }
    
    return null;
  };

  const statusMsg = getButtonMessage();

  const isBaseDisabled = !currentLocation || !isWithinOfficeRadius() || loading;
  const isCheckInDisabled = isBaseDisabled || !canCheckIn;
  const isCheckOutDisabled = isBaseDisabled || !canCheckOut;

  return (
    <div className="space-y-3">
      {/* Alert / Status Bar */}
      {statusMsg && (
        <div className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs sm:text-sm font-medium animate-fade-in ${statusMsg.bg}`}>
          {statusMsg.icon}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Button Grid - Large & Thumb friendly */}
      <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
        {/* Tombol Presensi Masuk (Emerald Gold) */}
        <button
          onClick={handleCheckIn}
          disabled={isCheckInDisabled}
          className={`relative group overflow-hidden py-3.5 sm:py-4 px-4 rounded-2xl font-bold text-sm sm:text-base flex flex-col items-center justify-center gap-1 transition-all duration-300 active:scale-[0.98] ${
            !isCheckInDisabled
              ? 'bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/50 hover:shadow-emerald-500/30 border border-amber-400/40'
              : 'bg-islamic-950/80 text-slate-500 border border-slate-800 cursor-not-allowed'
          }`}
        >
          {!isCheckInDisabled && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400"></span>
            </span>
          )}
          <div className="flex items-center gap-2">
            <CheckCircle2 className={`w-5 h-5 text-amber-300 ${loading && !isCheckInDisabled ? 'animate-spin' : ''}`} />
            <span className="tracking-wide">
              {hasCheckedInToday ? 'Sudah Presensi Masuk' : 'Presensi Masuk'}
            </span>
          </div>
          <span className="text-[11px] font-normal text-amber-200/80">
            {!hasCheckedInToday ? 'Bismillah • Awali Hari Kerja' : 'Tercatat'}
          </span>
        </button>

        {/* Tombol Presensi Pulang (Islamic Royal Gold) */}
        <button
          onClick={handleCheckOut}
          disabled={isCheckOutDisabled}
          className={`relative group overflow-hidden py-3.5 sm:py-4 px-4 rounded-2xl font-bold text-sm sm:text-base flex flex-col items-center justify-center gap-1 transition-all duration-300 active:scale-[0.98] ${
            !isCheckOutDisabled
              ? 'bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 text-slate-950 shadow-lg shadow-amber-950/50 hover:shadow-amber-500/30 border border-amber-300'
              : 'bg-islamic-950/80 text-slate-500 border border-slate-800 cursor-not-allowed'
          }`}
        >
          {!isCheckOutDisabled && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-200 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-300"></span>
            </span>
          )}
          <div className="flex items-center gap-2">
            <LogOut className={`w-5 h-5 ${loading && !isCheckOutDisabled ? 'animate-spin' : ''}`} />
            <span className="tracking-wide">Presensi Pulang</span>
          </div>
          <span className="text-[11px] font-normal opacity-90">
            {!isCheckOutDisabled ? 'Alhamdulillah • Selesai Bertugas' : 'Tutup Tugas'}
          </span>
        </button>
      </div>

      {/* Jadwal Jam Kerja Ringkas */}
      {scheduleTime && (
        <div className="glass-panel p-2.5 rounded-xl border border-amber-500/15 flex flex-wrap items-center justify-around gap-2 text-xs text-slate-300 text-center">
          <div className="flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Jam Masuk:</span>
            <strong className="text-amber-200">{scheduleTime.check_in_start.slice(0, 5)} - {scheduleTime.check_in_end.slice(0, 5)}</strong>
          </div>
          <span className="text-slate-600 hidden xs:inline">•</span>
          <div className="flex items-center gap-1.5">
            <Moon className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Jam Pulang:</span>
            <strong className="text-emerald-200">{scheduleTime.check_out_start.slice(0, 5)} - {scheduleTime.check_out_end.slice(0, 5)}</strong>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceButtons;