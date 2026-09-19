import React, { useState, useEffect } from 'react';
import { UserX, Users, Lock, CheckCircle2, AlertTriangle, Search, Shield, Trash2, Loader2, X } from 'lucide-react';
import { api } from '../../../services/api';

interface AccountListProps {
  userList: Array<{
    id: string;
    username: string;
    full_name: string;
    role: string;
  }>;
  onDeleteUser: (userId: string) => void;
  loading: boolean;
}

interface Notification {
  type: 'success' | 'error';
  message: string;
}

const AccountList: React.FC<AccountListProps> = ({ userList, onDeleteUser, loading }) => {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [modalError, setModalError] = useState('');
  const [deletedUsername, setDeletedUsername] = useState('');
  const [notification, setNotification] = useState<Notification | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleDeleteClick = (userId: string, username: string) => {
    setSelectedUserId(userId);
    setDeletedUsername(username);
    setShowConfirmModal(true);
    setModalError('');
    setAdminPassword('');
  };

  const handleConfirmDelete = async () => {
    if (!adminPassword) {
      setModalError('Masukkan kata sandi admin Anda untuk verifikasi.');
      return;
    }

    try {
      setIsDeleting(true);
      await api.auth.verifyAdmin(adminPassword);
      await api.users.delete(selectedUserId);
      onDeleteUser(selectedUserId);
      handleCloseModal();
      setNotification({
        type: 'success',
        message: `Alhamdulillah! Akun @${deletedUsername} berhasil dihapus dari sistem.`
      });
    } catch (err: any) {
      setModalError(err.message || 'Verifikasi kata sandi admin gagal atau akun tidak dapat dihapus');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseModal = () => {
    setShowConfirmModal(false);
    setAdminPassword('');
    setModalError('');
    setSelectedUserId('');
    setDeletedUsername('');
  };

  const filteredUsers = userList.filter(user => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.full_name.toLowerCase().includes(query) ||
      user.username.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    );
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="rounded-2xl glass-card overflow-hidden border border-amber-500/20">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-amber-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">Daftar Seluruh Akun Terdaftar</h2>
            <p className="text-xs text-slate-300">Pantau dan kelola hak akses seluruh akun aktif</p>
          </div>
        </div>

        {/* Kotak Pencarian */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama atau username..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl glass-input text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
          />
        </div>
      </div>

      {/* Global Notification */}
      {notification && (
        <div className="m-4 p-3.5 rounded-xl text-xs sm:text-sm flex items-center gap-3 animate-fade-in bg-emerald-950/80 border border-emerald-500/40 text-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-amber-500/15 bg-islamic-950/60">
              <th className="py-3.5 px-6 text-xs font-semibold text-amber-200 uppercase tracking-wider">Nama Pegawai</th>
              <th className="py-3.5 px-6 text-xs font-semibold text-amber-200 uppercase tracking-wider">Username</th>
              <th className="py-3.5 px-6 text-xs font-semibold text-amber-200 uppercase tracking-wider">Hak Akses</th>
              <th className="py-3.5 px-6 text-right text-xs font-semibold text-amber-200 uppercase tracking-wider">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-amber-500/10">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-islamic-900/40 transition-colors group">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-islamic-950 border border-amber-500/20 flex items-center justify-center text-xs font-bold text-amber-300 group-hover:border-amber-400/50 transition-colors">
                      {getInitials(user.full_name)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white group-hover:text-amber-300 transition-colors">
                        {user.full_name}
                      </p>
                      <p className="text-xs text-slate-400 font-mono">ID: {user.id}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="text-sm text-slate-300 font-mono">@{user.username}</span>
                </td>
                <td className="py-4 px-6">
                  {user.role === 'admin' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      <Shield className="w-3 h-3" />
                      Administrator
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      Pegawai
                    </span>
                  )}
                </td>
                <td className="py-4 px-6 text-right">
                  {user.role === 'admin' ? (
                    <span className="text-xs text-amber-400/60 italic font-medium">Akun Utama</span>
                  ) : (
                    <button
                      onClick={() => handleDeleteClick(user.id, user.username)}
                      disabled={loading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 active:scale-95 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Akun</span>
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={4} className="py-12 text-center text-slate-400">
                  <Users className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                  <p className="text-sm">Tidak ditemukan akun yang sesuai dengan pencarian</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Stack View */}
      <div className="md:hidden p-4 space-y-3">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="p-4 rounded-xl glass-panel border border-amber-500/15 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-islamic-950 border border-amber-500/20 flex items-center justify-center text-xs font-bold text-amber-300">
                  {getInitials(user.full_name)}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{user.full_name}</p>
                  <p className="text-xs text-slate-400 font-mono">@{user.username}</p>
                </div>
              </div>
              <div>
                {user.role === 'admin' ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    Admin
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    Pegawai
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-amber-500/10">
              <span className="text-[11px] text-slate-400 font-mono">ID: {user.id}</span>
              {user.role !== 'admin' && (
                <button
                  onClick={() => handleDeleteClick(user.id, user.username)}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredUsers.length === 0 && (
          <div className="py-8 text-center text-slate-400">
            <p className="text-xs">Tidak ditemukan akun yang sesuai</p>
          </div>
        )}
      </div>

      {/* Modal Konfirmasi Keamanan Penghapusan */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="rounded-2xl glass-card p-6 sm:p-8 w-full max-w-md border border-rose-500/30 shadow-2xl shadow-rose-500/15 relative">
            <button
              onClick={handleCloseModal}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/35 flex items-center justify-center mx-auto mb-4 text-rose-400">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Konfirmasi Keamanan Administrator
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2">
                Anda akan menghapus akun pegawai <span className="text-rose-400 font-bold">@{deletedUsername}</span>. Silakan masukkan kata sandi akun Admin Anda untuk melanjutkan:
              </p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm focus:outline-none focus:border-rose-500 transition-all"
                  placeholder="Masukkan kata sandi admin..."
                  autoFocus
                />
              </div>

              {modalError && (
                <div className="p-3 rounded-xl bg-rose-950/90 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-2.5 rounded-xl glass-panel text-slate-300 hover:text-white text-xs sm:text-sm font-semibold transition-all"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-lg shadow-rose-950/50 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menghapus...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Konfirmasi Hapus</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountList;