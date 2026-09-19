import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, Sparkles, ArrowRight, AlertCircle, Moon } from 'lucide-react';
import { api } from '../services/api';
import IslamicBackground from '../components/common/IslamicBackground';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await api.auth.login(username, password);

      localStorage.setItem('authToken', data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));

      if (data.user.role === 'admin') {
        navigate('/admin');
      } else if (data.user.role === 'user') {
        navigate('/user');
      }
    } catch (err: any) {
      setError(err.message || 'Nama pengguna atau kata sandi tidak cocok. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-8 overflow-hidden">
      {/* Ornamen Latar Belakang Islami (Arabesque, Kubah Masjid & Sabit Emas) */}
      <IslamicBackground />

      {/* Ambient Islamic Emerald & Gold Blobs */}
      <div className="ambient-blob -top-24 -left-24 w-96 h-96 bg-emerald-600/25 animate-float-slow" />
      <div className="ambient-blob top-1/2 -right-24 w-[30rem] h-[30rem] bg-amber-600/20 animate-float-reverse" />
      <div className="ambient-blob -bottom-24 left-1/3 w-80 h-80 bg-teal-600/20 animate-pulse-glow" />

      {/* Subtle Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#d4af37 1px, transparent 1px)`,
          backgroundSize: '28px 28px'
        }}
      />

      <div className="relative w-full max-w-md z-10 animate-fade-up">
        {/* Brand Header */}
        <div className="text-center mb-6">
          {/* Basmalah Calligraphy / Arabic text */}
          <div className="mb-3 text-amber-300/90 font-serif tracking-widest text-lg select-none">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border-amber-500/30 text-amber-300 text-xs font-semibold mb-3 shadow-glow-gold">
            <Moon className="w-3.5 h-3.5 text-amber-400" />
            <span>Sistem Presensi Berkah Geolokasi</span>
          </div>

          <div className="flex justify-center mb-3">
            <div className="relative p-3 rounded-2xl bg-gradient-to-tr from-emerald-600 via-amber-600 to-emerald-700 p-[1.5px] shadow-2xl backdrop-blur-md group hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 rounded-[14px] bg-islamic-950 flex items-center justify-center p-2">
                <img
                  src="/images/logo-smk.png"
                  alt="Logo Sekolah"
                  className="h-12 w-12 object-contain drop-shadow-md"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.src = '/images/fallback-logo.png';
                  }}
                />
              </div>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Masuk ke Akun Anda
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Silakan masukkan data akun Anda untuk memulai presensi
          </p>
        </div>

        {/* Glassmorphism Islamic Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 relative shadow-2xl border border-amber-500/25">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/40 flex items-start gap-3 animate-fade-in text-rose-200">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm leading-snug">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-amber-200 uppercase tracking-wider mb-2">
                Nama Pengguna (Username)
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-400 transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Masukkan nama pengguna"
                  className="w-full pl-11 pr-4 py-3 rounded-xl glass-input text-sm focus:ring-2 focus:ring-amber-500/25 focus:border-amber-500 placeholder-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-200 uppercase tracking-wider mb-2">
                Kata Sandi
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-400 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Masukkan kata sandi"
                  className="w-full pl-11 pr-11 py-3 rounded-xl glass-input text-sm focus:ring-2 focus:ring-amber-500/25 focus:border-amber-500 placeholder-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-amber-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-500 hover:to-teal-600 transition-all duration-300 shadow-lg shadow-emerald-950/60 border border-amber-400/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 mt-3"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-amber-300" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Sedang Masuk...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Sistem</span>
                  <ArrowRight className="w-4 h-4 text-amber-300" />
                </>
              )}
            </button>
          </form>


        </div>

        {/* Footer */}
        <p className="text-center text-xs text-amber-300/60 mt-6 tracking-wide">
          &copy; 2026 PBYL. ALL RIGHTS RESERVED.
        </p>
      </div>
    </div>
  );
}