import React, { useState, useEffect, useRef } from 'react';
import { UserPlus, User, Lock, BadgeCheck, Eye, EyeOff, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

interface CreateAccountFormProps {
  newUser: {
    username: string;
    password: string;
    full_name: string;
    role: string;
  };
  setNewUser: (user: any) => void;
  handleCreateUser: (e: React.FormEvent) => void;
  loading: boolean;
}

interface Notification {
  type: 'success' | 'error';
  message: string;
}

const CreateAccountForm: React.FC<CreateAccountFormProps> = ({
  newUser,
  setNewUser,
  handleCreateUser,
  loading,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

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

    if (!newUser.full_name || !newUser.username || !newUser.password || newUser.password.length < 6) {
      setNotification({
        type: 'error',
        message: 'Mohon lengkapi semua kolom dengan benar (Kata sandi minimal 6 karakter).'
      });
      return;
    }

    try {
      await handleCreateUser(e);
      setNotification({
        type: 'success',
        message: `Alhamdulillah! Akun "${newUser.username}" berhasil didaftarkan.`
      });
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Gagal menambahkan akun baru'
      });
    }
  };

  return (
    <div className="rounded-2xl glass-card overflow-hidden border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300">
      <div className="px-5 py-4 border-b border-amber-500/15 bg-islamic-950/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/35 flex items-center justify-center text-emerald-300">
            <UserPlus className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">Pendaftaran Akun Pegawai Baru</h2>
            <p className="text-[11px] text-slate-300">Tambahkan akun pengguna untuk pegawai atau admin</p>
          </div>
        </div>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
        {/* Nama Lengkap */}
        <div>
          <label className="block text-xs font-semibold text-amber-200 uppercase tracking-wider mb-2">
            Nama Lengkap Pegawai
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={newUser.full_name}
              onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm focus:outline-none focus:border-amber-500 transition-all"
              placeholder="Contoh: Ahmad Fadilah"
              required
            />
          </div>
        </div>

        {/* Username */}
        <div>
          <label className="block text-xs font-semibold text-amber-200 uppercase tracking-wider mb-2">
            Nama Pengguna (Username)
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm focus:outline-none focus:border-amber-500 transition-all font-mono"
              placeholder="ahmad_f"
              required
            />
          </div>
        </div>

        {/* Peran Akses */}
        <div>
          <label className="block text-xs font-semibold text-amber-200 uppercase tracking-wider mb-2">
            Peran Akses (Role)
          </label>
          <div className="relative">
            <BadgeCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm focus:outline-none focus:border-amber-500 transition-all"
              required
            >
              <option value="user">Pegawai (Pengguna Presensi)</option>
              <option value="admin">Administrator Sistem</option>
            </select>
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-amber-200 uppercase tracking-wider mb-2">
            Kata Sandi
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              className="w-full pl-10 pr-11 py-2.5 rounded-xl glass-input text-sm focus:outline-none focus:border-amber-500 transition-all font-mono"
              placeholder="Minimal 6 karakter..."
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-300"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-950/60 border border-amber-400/40 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses Pendaftaran...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 text-amber-300" />
                <span>Daftarkan Akun Baru</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAccountForm;