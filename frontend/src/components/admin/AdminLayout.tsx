import React, { useState, useRef, useEffect } from 'react';
import { UserPlus, LogOut, Clock, MapPin, LayoutDashboard, Calendar, ShieldCheck, Menu, X, Moon } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import IslamicBackground from '../common/IslamicBackground';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [time, setTime] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB');
      setDateStr(now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      navigate('/login');
    } catch (err: any) {
      console.error('Logout error:', err);
    }
  };

  const navLinks = [
    { to: '/admin', label: 'Beranda Admin', icon: LayoutDashboard },
    { to: '/admin/location-settings', label: 'Titik Lokasi', icon: MapPin },
    { to: '/admin/account-creation', label: 'Kelola Akun', icon: UserPlus },
    { to: '/admin/schedule-settings', label: 'Jadwal Kerja', icon: Calendar },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="relative min-h-screen text-slate-100 pb-24 md:pb-12 overflow-x-hidden">
      {/* Ornamen Latar Belakang Islami (Arabesque, Kubah Masjid & Sabit Emas) */}
      <IslamicBackground />

      {/* Background ambient Islamic emerald & gold glows */}
      <div className="ambient-blob -top-32 -right-32 w-96 h-96 bg-emerald-700/20" />
      <div className="ambient-blob top-1/2 -left-32 w-96 h-96 bg-amber-600/15" />
      <div className="ambient-blob -bottom-24 right-1/4 w-80 h-80 bg-teal-700/20" />

      {/* Floating Glass Navbar */}
      <header className="fixed top-0 left-0 right-0 z-40 px-3 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto glass-panel rounded-2xl px-4 py-2.5 shadow-glass flex items-center justify-between border border-amber-500/20 backdrop-blur-xl">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link to="/admin" className="flex items-center gap-3 group">
              <div className="relative p-1.5 rounded-xl bg-gradient-to-tr from-emerald-600 to-amber-500 border border-amber-400/40 shadow-md group-hover:scale-105 transition-transform">
                <img 
                  src="/images/logo-smk.png" 
                  alt="Logo Sekolah" 
                  className="h-8 w-8 object-contain"
                  onError={(e) => {
                    const imgElement = e.currentTarget as HTMLImageElement;
                    imgElement.style.display = 'none';
                  }}
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm sm:text-base font-bold text-white tracking-tight">Panel Administrator</span>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-300">
                    <Moon className="w-2.5 h-2.5 text-amber-400" /> Admin Utama
                  </span>
                </div>
                <p className="text-[11px] text-amber-200/80 hidden xs:block">{dateStr}</p>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-islamic-950/70 p-1 rounded-xl border border-amber-500/20">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? 'bg-gradient-to-r from-emerald-600 to-amber-600 text-white shadow-md shadow-emerald-900/40 font-semibold border border-amber-400/30'
                      : 'text-slate-300 hover:text-amber-300 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Section: Time & Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Clock Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-card border-amber-500/20 text-xs text-amber-200">
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="font-mono font-bold tracking-wider">{time}</span>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-semibold transition-all active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>

            {/* Mobile Menu Dropdown Toggle */}
            <div className="relative lg:hidden" ref={menuRef}>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-xl glass-panel text-slate-300 hover:text-white transition-colors"
                aria-label="Menu"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-3 w-56 glass-card rounded-2xl shadow-2xl p-2 z-50 border border-amber-500/25 animate-scale-in">
                  <div className="px-3 py-2 border-b border-amber-500/15 mb-1">
                    <p className="text-xs font-bold text-amber-300">Menu Navigasi</p>
                    <p className="text-[11px] text-slate-400">{dateStr} • {time}</p>
                  </div>

                  <div className="space-y-1">
                    {navLinks.map((link) => {
                      const Icon = link.icon;
                      const active = isActive(link.to);
                      return (
                        <Link
                          key={link.to}
                          to={link.to}
                          onClick={() => setIsMenuOpen(false)}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                            active
                              ? 'bg-emerald-600 text-white font-semibold shadow-md'
                              : 'text-slate-300 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <Icon className="w-4 h-4 text-amber-400" />
                          <span>{link.label}</span>
                        </Link>
                      );
                    })}
                  </div>

                  <div className="border-t border-amber-500/15 mt-2 pt-1">
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-300 hover:bg-rose-500/15 transition-all font-medium"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      <span>Keluar dari Sistem</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 pt-20 sm:pt-24">
        {title && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>{title}</span>
            </h1>
          </div>
        )}
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden px-2 py-2 bg-islamic-950/95 backdrop-blur-xl border-t border-amber-500/20 shadow-2xl">
        <div className="grid grid-cols-4 gap-1 max-w-md mx-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-[10px] font-medium transition-all ${
                  active
                    ? 'text-amber-300 bg-amber-500/15 font-semibold border border-amber-500/25 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 active:scale-95'
                }`}
              >
                <Icon className={`w-4 h-4 mb-0.5 ${active ? 'text-amber-400' : ''}`} />
                <span className="truncate max-w-[70px]">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}