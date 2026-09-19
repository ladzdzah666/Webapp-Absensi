import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import CreateAccountForm from '../components/admin/akun/CreateAccountForm';
import ResetPasswordForm from '../components/admin/akun/ResetPasswordForm';
import AccountList from '../components/admin/akun/AccountList';
import { api } from '../services/api';
import { Users, Moon } from 'lucide-react';

export default function AccountCreation() {
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    full_name: '',
    role: 'user',
  });

  const [resetPasswordData, setResetPasswordData] = useState({
    username: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<Array<{
    id: string;
    username: string;
    full_name: string;
    role: string;
  }>>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await api.users.getAll();
      setUsers(data);
    } catch (err) {
      console.error('Gagal mengambil data user:', err);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.auth.register(newUser);
      setNewUser({ username: '', password: '', full_name: '', role: 'user' });
      await fetchUsers();
    } catch (err: any) {
      console.error('Gagal membuat user:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    } catch (err: any) {
      console.error('Gagal memperbarui daftar user:', err);
    }
  };

  return (
    <AdminLayout title="Kelola Akun & Hak Akses">
      <div className="space-y-6">
        {/* Hero Header */}
        <div className="relative rounded-2xl glass-card overflow-hidden p-5 sm:p-7 border border-amber-500/20">
          <div className="absolute top-0 right-0 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 mb-2">
                <Moon className="w-3.5 h-3.5 text-amber-400" />
                Manajemen Akun Pegawai
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Pendaftaran & Pemulihan Kata Sandi
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                Daftarkan akun pegawai baru, pulihkan kata sandi yang terlupa, dan pantau status seluruh pengguna aktif di sistem presensi.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-3 rounded-xl bg-islamic-950/80 border border-amber-500/20 text-center">
                <span className="text-[10px] uppercase font-semibold text-amber-300/80 block">Total Akun</span>
                <span className="text-lg font-bold text-amber-400">{users.length} akun</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Grid: Buat Akun & Reset Kata Sandi */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CreateAccountForm
            newUser={newUser}
            setNewUser={setNewUser}
            handleCreateUser={handleCreateUser}
            loading={loading}
          />
          <ResetPasswordForm
            resetPasswordData={resetPasswordData}
            setResetPasswordData={setResetPasswordData}
            userList={users.map(user => user.username)}
            loading={loading}
          />
        </div>

        {/* Tabel Akun Aktif */}
        <AccountList 
          userList={users}
          onDeleteUser={handleDeleteUser}
          loading={loading}
        />
      </div>
    </AdminLayout>
  );
}