import React, { useState, useEffect } from 'react';
import { LogOut, Clock, Sparkles, User as UserIcon, Moon, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import IslamicBackground from '../common/IslamicBackground';

interface UserLayoutProps {
  children: React.ReactNode;
}

export default function UserLayout({ children }: UserLayoutProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [time, setTime] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB');
      setDateStr(now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  return (
    <div className="relative min-h-screen text-slate-100 pb-20 sm:pb-8 overflow-x-hidden">
      {/* Ornamen Latar Belakang Islami (Arabesque, Kubah Masjid & Sabit Emas) */}
      <IslamicBackground />

      {/* Ambient Islamic Emerald & Gold Blobs */}
      <div className="ambient-blob -top-32 -left-32 w-96 h-96 bg-emerald-700/25" />
      <div className="ambient-blob top-1/4 -right-32 w-96 h-96 bg-amber-600/15" />
      <div className="ambient-blob bottom-10 left-1/3 w-80 h-80 bg-teal-700/20" />

      {/* Floating Glass Navbar */}
      <header className="fixed top-0 left-0 right-0 z-40 px-3 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto glass-panel rounded-2xl px-4 py-2.5 flex items-center justify-between border border-amber-500/20 shadow-glass backdrop-blur-xl">
          {/* Logo & Brand with Islamic Aesthetic */}
          <div className="flex items-center gap-3">
            <div className="relative p-1.5 rounded-xl bg-gradient-to-tr from-emerald-600 to-amber-500 border border-amber-400/40 shadow-md">
              <img
                src="/images/logo-smk.png"
                alt="Logo Sekolah"
                className="h-8 w-8 object-contain"
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement;
                  img.style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base font-bold text-white tracking-tight">Presensi Berkah</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                  <Moon className="w-2.5 h-2.5 text-amber-400" /> Aktif
                </span>
              </div>
              <p className="text-[11px] text-amber-300/80 hidden xs:block">{dateStr}</p>
            </div>
          </div>

          {/* Real-time Clock & User Profile */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Live Clock Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl glass-card border-amber-500/20 text-xs text-amber-200">
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="font-mono font-bold tracking-wider">{time}</span>
            </div>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2.5 pl-2 sm:pl-3 sm:border-l border-amber-500/20">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-amber-500 p-[1.5px] shadow-md shadow-emerald-950">
                <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center font-bold text-amber-300 text-xs">
                  {user?.full_name ? user.full_name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                </div>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-slate-100 leading-tight truncate max-w-[130px]">
                  {user?.full_name || 'Pegawai'}
                </p>
                <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                  Pegawai Aktif
                </span>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              title="Keluar dari sistem"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all active:scale-95"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 pt-20 sm:pt-24">
        {children}
      </main>

      {/* Mobile Bottom Quick Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 sm:hidden px-4 py-2.5 bg-islamic-950/95 backdrop-blur-xl border-t border-amber-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-amber-200">
          <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="font-mono font-semibold">{time}</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-300 truncate max-w-[140px]">{user?.full_name || 'Pegawai'}</span>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
          <span className="text-emerald-300 font-semibold">Aktif</span>
        </div>
      </nav>
    </div>
  );
}