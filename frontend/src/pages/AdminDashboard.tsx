import React, { useState, useEffect, useRef } from 'react';
import { Attendance } from '../types';
import AdminLayout from '../components/admin/AdminLayout';
import { api } from '../services/api';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Download, Calendar, ChevronLeft, ChevronRight, CheckCircle2, User, Activity, Clock, Search, MapPin, AlertTriangle, XCircle, ArrowLeft, ArrowRight, RefreshCw, FileSpreadsheet, Moon, Sparkles } from 'lucide-react';
import * as XLSX from 'xlsx';

/**
 * AdminDashboard: Halaman utama administrator berdesain Elegan & Islami.
 * Memantau data kehadiran pegawai dengan akurasi geolokasi GPS secara real-time.
 */
export default function AdminDashboard() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [dailyAttendance, setDailyAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  
  // Filter & Navigasi
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'present' | 'late' | 'absent'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const USERS_PER_PAGE = 6;
  const attendanceContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    fetchAttendance();
    fetchUsers();
  }, [selectedMonth]);

  useEffect(() => {
    if (users.length > 0) {
      generateDailyAttendanceData();
    }
  }, [users, attendance, selectedDate]);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, selectedStatus]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const startDate = startOfMonth(selectedMonth);
      const endDate = endOfMonth(selectedMonth);
      
      const data = await api.attendance.getAllAttendance({
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd')
      });

      const processedData = data.map((att: any) => {
        try {
          return {
            ...att,
            created_at: att.check_in_time ? format(parseISO(att.check_in_time), "yyyy-MM-dd'T'HH:mm:ss") : null,
            check_in_time: att.check_in_time ? format(parseISO(att.check_in_time), "yyyy-MM-dd'T'HH:mm:ss") : null,
            check_out_time: att.check_out_time ? format(parseISO(att.check_out_time), "yyyy-MM-dd'T'HH:mm:ss") : null,
            status: att.status || (att.check_in_time ? 'present' : 'absent')
          };
        } catch (err) {
          return null;
        }
      }).filter(Boolean);

      setAttendance(processedData);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat catatan kehadiran pegawai');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await api.users.getAll();
      const nonAdminUsers = data.filter((user: any) => user.role !== 'admin').map((user: any) => ({
        id: user.id,
        full_name: user.full_name,
        username: user.username,
        email: user.username || user.email,
        role: user.role
      }));
      setUsers(nonAdminUsers);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat daftar pegawai');
    }
  };

  const generateDailyAttendanceData = () => {
    const daily: Attendance[] = [];
    
    const dayAttendance = attendance.filter(att => {
      if (!att.created_at) return false;
      try {
        return isSameDay(parseISO(att.created_at), selectedDate);
      } catch (err) {
        return false;
      }
    });
    
    users.forEach(user => {
      const userAttendance = dayAttendance.find(att => att.user_id === user.id);
      
      if (userAttendance) {
        const updatedAttendance = { ...userAttendance };
        if (updatedAttendance.check_in_time && updatedAttendance.check_out_time) {
          updatedAttendance.status = 'present';
        } else if (updatedAttendance.check_in_time) {
          updatedAttendance.status = 'present';
        } else if (!updatedAttendance.check_in_time && updatedAttendance.check_out_time) {
          updatedAttendance.status = 'late';
        }

        updatedAttendance.user = {
          full_name: user.full_name,
          username: user.username || user.email || ''
        };
        
        daily.push(updatedAttendance);
      } else {
        const absentRecord: Attendance = {
          id: `absent-${user.id}-${format(selectedDate, 'yyyy-MM-dd')}`,
          user_id: user.id,
          check_in_time: null,
          check_out_time: null,
          check_in_latitude: null,
          check_in_longitude: null,
          check_out_latitude: null,
          check_out_longitude: null,
          status: 'absent',
          created_at: format(selectedDate, "yyyy-MM-dd'T'HH:mm:ss"),
          user: {
            full_name: user.full_name,
            username: user.email
          }
        };
        daily.push(absentRecord);
      }
    });
    
    setDailyAttendance(daily);
  };

  const getFilteredDailyAttendances = () => {
    return dailyAttendance.filter(att => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const nameMatch = att.user?.full_name?.toLowerCase().includes(query);
        const usernameMatch = att.user?.username?.toLowerCase().includes(query);
        if (!nameMatch && !usernameMatch) return false;
      }
      
      if (selectedStatus !== 'all' && att.status !== selectedStatus) {
        return false;
      }
      
      return true;
    });
  };

  const prevDay = () => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 1);
      return newDate;
    });
  };

  const nextDay = () => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 1);
      return newDate;
    });
  };

  const setToday = () => {
    setSelectedDate(new Date());
  };

  const getStats = () => {
    const present = dailyAttendance.filter(att => att.status === 'present').length;
    const late = dailyAttendance.filter(att => att.status === 'late').length;
    const absent = dailyAttendance.filter(att => att.status === 'absent').length;
    const total = users.length;
    
    return { present, late, absent, total };
  };

  const groupAttendancesByUser = () => {
    const filtered = getFilteredDailyAttendances();
    const grouped = new Map();
    
    filtered.forEach(att => {
      if (!grouped.has(att.user_id)) {
        const user = users.find(u => u.id === att.user_id);
        grouped.set(att.user_id, {
          user: user || { full_name: att.user?.full_name || 'Pegawai', id: att.user_id, username: att.user?.username },
          attendances: []
        });
      }
      grouped.get(att.user_id).attendances.push(att);
    });
    
    return Array.from(grouped.values());
  };

  const getPaginatedUsers = () => {
    const filtered = groupAttendancesByUser();
    const totalPages = Math.ceil(filtered.length / USERS_PER_PAGE);
    
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(totalPages - 1);
      return filtered.slice(0, USERS_PER_PAGE);
    }
    
    const start = currentPage * USERS_PER_PAGE;
    return filtered.slice(start, start + USERS_PER_PAGE);
  };

  const getTotalPages = () => {
    const filtered = groupAttendancesByUser();
    return Math.max(1, Math.ceil(filtered.length / USERS_PER_PAGE));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            Hadir
          </span>
        );
      case 'late':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Clock className="w-3 h-3" />
            Terlambat
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <XCircle className="w-3 h-3" />
            Belum Absen
          </span>
        );
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const exportToExcel = () => {
    try {
      setLoading(true);
      const monthStart = startOfMonth(selectedMonth);
      const monthEnd = endOfMonth(selectedMonth);
      const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
      
      const sortedUsers = [...users].sort((a, b) => a.full_name.localeCompare(b.full_name));
      const workbook = XLSX.utils.book_new();
      
      const rekapPerNama = sortedUsers.map(user => {
        const userAttendances = attendance.filter(att => att.user_id === user.id);
        const presentCount = userAttendances.filter(att => att.status === 'present').length;
        const lateCount = userAttendances.filter(att => att.status === 'late').length;
        const absentCount = Math.max(0, daysInMonth.length - (presentCount + lateCount));
        
        return {
          'Nama Pegawai': user.full_name,
          'Username': user.username,
          'Total Hadir': presentCount,
          'Terlambat': lateCount,
          'Tidak Hadir': absentCount,
          'Total Hari Kerja': daysInMonth.length
        };
      });

      const summaryWs = XLSX.utils.json_to_sheet(rekapPerNama);
      XLSX.utils.book_append_sheet(workbook, summaryWs, 'Rekap Bulanan');
      
      const monthYear = format(selectedMonth, 'MMMM_yyyy');
      XLSX.writeFile(workbook, `Rekap_Presensi_${monthYear}.xlsx`);
    } catch (err) {
      setError('Gagal mengekspor data ke format Excel');
    } finally {
      setLoading(false);
    }
  };

  const stats = getStats();
  const paginatedUsers = getPaginatedUsers();
  const totalUsersCount = groupAttendancesByUser().length;

  return (
    <AdminLayout title="Pemantauan & Rekapitulasi Presensi">
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
          <button onClick={() => setError('')} className="text-rose-400 hover:text-rose-200">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Header Islami */}
      <div className="relative mb-6 rounded-2xl glass-card overflow-hidden p-5 sm:p-7 border border-amber-500/20">
        <div className="absolute top-0 right-0 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 mb-2">
              <Moon className="w-3.5 h-3.5 text-amber-400" />
              Sistem Presensi Berkah Berbasis Geolokasi
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Beranda Administrator Presensi
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              Pantau kepatuhan kehadiran pegawai secara amanah dan akurat dengan koordinat GPS real-time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportToExcel}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 shadow-md shadow-amber-950/50 active:scale-95 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Ekspor Rekap Excel</span>
            </button>
            <button
              onClick={() => { fetchAttendance(); fetchUsers(); }}
              className="p-2.5 rounded-xl glass-panel text-amber-300 hover:text-white border border-amber-500/20 active:scale-95 transition-all"
              title="Segarkan Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Kartu Ringkasan Metrik Kehadiran */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {/* Total Pegawai */}
        <div className="rounded-2xl glass-card p-4 sm:p-5 border border-amber-500/15 group hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-200/90 uppercase tracking-wider">Total Pegawai</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300">
              <User className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">{stats.total}</span>
            <span className="text-xs text-slate-400">orang</span>
          </div>
          <p className="mt-1 text-[11px] text-amber-300/70">Terdaftar aktif</p>
        </div>

        {/* Hadir */}
        <div className="rounded-2xl glass-card p-4 sm:p-5 border border-emerald-500/20 group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider">Hadir Hari Ini</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">{stats.present}</span>
            <span className="text-xs text-emerald-300/70">pegawai</span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-300/80">
            {stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}% Tingkat kehadiran
          </p>
        </div>

        {/* Terlambat */}
        <div className="rounded-2xl glass-card p-4 sm:p-5 border border-amber-500/20 group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider">Terlambat</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-400">{stats.late}</span>
            <span className="text-xs text-amber-300/70">pegawai</span>
          </div>
          <p className="mt-1 text-[11px] text-amber-300/70">Lewat batas jam masuk</p>
        </div>

        {/* Belum Absen */}
        <div className="rounded-2xl glass-card p-4 sm:p-5 border border-rose-500/20 group hover:border-rose-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-rose-300 uppercase tracking-wider">Belum Presensi</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-300">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-400">{stats.absent}</span>
            <span className="text-xs text-rose-300/70">pegawai</span>
          </div>
          <p className="mt-1 text-[11px] text-rose-300/70">Tanpa rekaman masuk</p>
        </div>
      </div>

      {/* Konten Utama */}
      <div className="rounded-2xl glass-card overflow-hidden border border-amber-500/20" ref={attendanceContainerRef}>
        {/* Bilah Filter & Tanggal */}
        <div className="p-4 sm:p-5 border-b border-amber-500/15 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Navigasi Tanggal */}
            <div className="inline-flex items-center justify-between sm:justify-start gap-2 bg-islamic-950/80 border border-amber-500/20 rounded-xl p-1.5">
              <button 
                onClick={prevDay}
                className="p-1.5 rounded-lg text-slate-300 hover:text-amber-300 hover:bg-slate-800 transition-colors"
                aria-label="Hari sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-2 px-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span className="text-xs sm:text-sm font-semibold text-white tracking-wide">
                  {format(selectedDate, 'EEEE, dd MMMM yyyy', { locale: localeId })}
                </span>
              </div>
              
              <button 
                onClick={nextDay}
                className="p-1.5 rounded-lg text-slate-300 hover:text-amber-300 hover:bg-slate-800 transition-colors"
                aria-label="Hari berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={setToday}
                className="ml-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors"
              >
                Hari Ini
              </button>
            </div>

            {/* Kotak Pencarian */}
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama atau username..."
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl glass-input text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  <XCircle className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Status Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-xs text-amber-200/90 font-medium mr-1 whitespace-nowrap">Filter Status:</span>
            {[
              { id: 'all', label: 'Semua Status' },
              { id: 'present', label: `Hadir (${stats.present})` },
              { id: 'late', label: `Terlambat (${stats.late})` },
              { id: 'absent', label: `Belum Absen (${stats.absent})` }
            ].map((chip) => {
              const isActive = selectedStatus === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => setSelectedStatus(chip.id as any)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md border border-amber-400/40'
                      : 'bg-islamic-950/60 text-slate-300 hover:text-amber-200 hover:bg-slate-800/80 border border-amber-500/15'
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Daftar Kartu Pegawai */}
        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <div className="relative w-12 h-12 mb-4">
                <div className="absolute inset-0 rounded-full border-2 border-amber-500/20 border-t-amber-400 animate-spin" />
              </div>
              <p className="text-sm font-medium">Memuat data presensi pegawai...</p>
            </div>
          ) : paginatedUsers.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-islamic-950 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Calendar className="w-7 h-7" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white">Tidak Ada Data Presensi</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Tidak ada catatan kehadiran pegawai yang cocok dengan filter atau tanggal yang dipilih.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedUsers.map((item) => {
                const att = item.attendances[0];
                const initials = getInitials(item.user.full_name || 'Pegawai');
                const hasCheckInLocation = att.check_in_latitude && att.check_in_longitude;
                
                return (
                  <div
                    key={item.user.id}
                    className="rounded-2xl glass-panel p-4 sm:p-5 border border-amber-500/15 hover:border-amber-500/35 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-950/40 group"
                  >
                    {/* Header Info Pegawai */}
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-amber-500/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-amber-500 p-[1.5px] shadow-sm">
                          <div className="w-full h-full rounded-[9px] bg-islamic-950 flex items-center justify-center text-xs font-bold text-amber-300">
                            {initials}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                            {item.user.full_name}
                          </h4>
                          <p className="text-xs text-slate-400">
                            @{item.user.username || 'user'}
                          </p>
                        </div>
                      </div>
                      <div>
                        {getStatusBadge(att.status)}
                      </div>
                    </div>

                    {/* Waktu Presensi */}
                    <div className="mt-3.5 grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-xl bg-islamic-950/70 border border-amber-500/10">
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">
                          Jam Masuk
                        </span>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-xs font-bold text-white">
                            {att.check_in_time ? format(parseISO(att.check_in_time), 'HH:mm') + ' WIB' : '-- : --'}
                          </span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-islamic-950/70 border border-amber-500/10">
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">
                          Jam Pulang
                        </span>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-xs font-bold text-white">
                            {att.check_out_time ? format(parseISO(att.check_out_time), 'HH:mm') + ' WIB' : '-- : --'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Koordinat GPS */}
                    <div className="mt-3 pt-2.5 border-t border-amber-500/10 flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        <span className="truncate max-w-[170px]">
                          {hasCheckInLocation
                            ? `${Number(att.check_in_latitude).toFixed(4)}, ${Number(att.check_in_longitude).toFixed(4)}`
                            : 'Lokasi belum terekam'}
                        </span>
                      </div>
                      {hasCheckInLocation && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                          GPS Valid
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer Pagination */}
          {totalUsersCount > 0 && (
            <div className="mt-6 pt-4 border-t border-amber-500/15 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-slate-400 text-center sm:text-left">
                Menampilkan <span className="font-semibold text-amber-300">{currentPage * USERS_PER_PAGE + 1}</span> -{' '}
                <span className="font-semibold text-amber-300">{Math.min((currentPage + 1) * USERS_PER_PAGE, totalUsersCount)}</span> dari{' '}
                <span className="font-semibold text-amber-300">{totalUsersCount}</span> pegawai
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                  className="p-2 rounded-xl glass-panel text-slate-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-all"
                  aria-label="Halaman sebelumnya"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-islamic-950 text-amber-200 border border-amber-500/20">
                  {currentPage + 1} / {getTotalPages()}
                </span>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(getTotalPages() - 1, prev + 1))}
                  disabled={currentPage >= getTotalPages() - 1}
                  className="p-2 rounded-xl glass-panel text-slate-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-all"
                  aria-label="Halaman berikutnya"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}