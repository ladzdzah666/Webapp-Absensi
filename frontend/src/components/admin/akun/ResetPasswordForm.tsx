import React, { useState, useEffect } from 'react';
import { KeyRound, User, Lock, Eye, EyeOff, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { api } from '../../../services/api';

interface Notification {
  type: 'success' | 'error';
  message: string;
}

interface ResetPasswordFormProps {
  resetPasswordData: {
    username: string;
    newPassword: string;
    confirmPassword: string;
  };
  setResetPasswordData: (data: any) => void;
  userList: string[];
  loading: boolean;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  resetPasswordData,
  setResetPasswordData,
  userList,
  loading,
}) => {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!resetPasswordData.username) {
        setNotification({
          type: 'error',
          message: 'Silakan pilih nama pengguna akun pegawai terlebih dahulu.'
        });
        return;
      }

      if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
        setNotification({
          type: 'error',
          message: 'Konfirmasi kata sandi tidak cocok dengan kata sandi baru.'
        });
        return;
      }

      if (resetPasswordData.newPassword.length < 6) {
        setNotification({
          type: 'error',
          message: 'Kata sandi baru minimal 6 karakter.'
        });
        return;
      }

      await api.auth.resetPassword(
        resetPasswordData.username,
        resetPasswordData.newPassword
      );

      setNotification({
        type: 'success',
        message: `Alhamdulillah! Kata sandi untuk akun @${resetPasswordData.username} berhasil direset.`
      });

      setResetPasswordData({
        username: '',
        newPassword: '',
        confirmPassword: ''
      });

    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Gagal mereset kata sandi pegawai'
      });
    }
  };

  return (
    <div className="rounded-2xl glass-card overflow-hidden border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300">
      <div className="px-5 py-4 border-b border-amber-500/15 bg-islamic-950/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/35 flex items-center justify-center text-amber-300">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">Pemulihan Kata Sandi</h2>
            <p className="text-[11px] text-slate-300">Ganti kata sandi pegawai yang lupa atau terkendala login</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
        {/* Pilih User */}
        <div>
          <label className="block text-xs font-semibold text-amber-200 uppercase tracking-wider mb-2">
            Pilih Akun Pegawai
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <select
              value={resetPasswordData.username}
              onChange={(e) => {
                setResetPasswordData({ ...resetPasswordData, username: e.target.value });
                setNotification(null);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm focus:outline-none focus:border-amber-500 transition-all"
              required
            >
              <option value="" disabled>-- Pilih Nama Pengguna (Username) --</option>
              {userList.map((uname) => (
                <option key={uname} value={uname} className="bg-islamic-950 text-slate-200">@{uname}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Password Baru */}
        <div>
          <label className="block text-xs font-semibold text-amber-200 uppercase tracking-wider mb-2">
            Kata Sandi Baru
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={resetPasswordData.newPassword}
              onChange={(e) => {
                setResetPasswordData({ ...resetPasswordData, newPassword: e.target.value });
                setNotification(null);
              }}
              className="w-full pl-10 pr-11 py-2.5 rounded-xl glass-input text-sm focus:outline-none focus:border-amber-500 transition-all font-mono"
              placeholder="Minimal 6 karakter..."
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-300"
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Konfirmasi Password Baru */}
        <div>
          <label className="block text-xs font-semibold text-amber-200 uppercase tracking-wider mb-2">
            Ulangi Kata Sandi Baru
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={resetPasswordData.confirmPassword}
              onChange={(e) => {
                setResetPasswordData({ ...resetPasswordData, confirmPassword: e.target.value });
                setNotification(null);
              }}
              className="w-full pl-10 pr-11 py-2.5 rounded-xl glass-input text-sm focus:outline-none focus:border-amber-500 transition-all font-mono"
              placeholder="Konfirmasi kata sandi..."
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-300"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Notifikasi */}
        {notification && (
          <div className={`p-3.5 rounded-xl text-xs sm:text-sm flex items-center gap-3 animate-fade-in ${
            notification.type === 'success'
              ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/80 border border-rose-500/40 text-rose-200'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Tombol Simpan */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:from-amber-300 hover:to-yellow-400 shadow-md shadow-amber-950/60 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Mereset Kata Sandi...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4 text-slate-950" />
                <span>Perbarui Kata Sandi Akun</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResetPasswordForm;