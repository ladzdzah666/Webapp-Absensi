# Presensi Berkah — Sistem Absensi Geolokasi

> Sistem presensi berbasis GPS untuk instansi. Pegawai hanya bisa absen saat berada dalam radius 100m dari kantor. Dibangun dengan React + Express + MySQL.

![Tech Stack](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?style=flat-square&logo=mysql)
![Leaflet](https://img.shields.io/badge/Leaflet-Maps-199900?style=flat-square&logo=leaflet)

---

## Apa yang dilakukan aplikasi ini?

Pegawai membuka aplikasi di HP → GPS mendeteksi lokasi → jika dalam radius 100m dari kantor, tombol **Absen Masuk** dan **Absen Pulang** aktif → absensi tercatat ke database dengan timestamp dan koordinat GPS.

Admin bisa lihat laporan harian seluruh pegawai, filter per tanggal/status, dan export ke Excel.

---

## Fitur

**Pegawai (Mobile-first)**
- Deteksi GPS real-time dengan `watchPosition` — posisi diperbarui terus
- Peta interaktif (Leaflet + OpenStreetMap) menunjukkan posisi pegawai vs radius kantor
- Tombol absen aktif hanya saat dalam radius — tidak bisa curang dari luar kantor
- Jadwal kerja ditampilkan (jam masuk & jam pulang dari database)
- Riwayat absensi hari ini: jam masuk, jam pulang, durasi kerja

**Admin (Dashboard)**
- Tabel rekap absensi seluruh pegawai per hari
- Filter berdasarkan tanggal dan status (Hadir / Terlambat / Absen)
- Export laporan ke Excel (`.xlsx`) menggunakan SheetJS
- Manajemen akun pegawai: buat, hapus, reset password
- Konfigurasi lokasi kantor (koordinat + radius) dan jadwal kerja

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS (custom Islamic/emerald theme) |
| Peta | Leaflet + React-Leaflet + OpenStreetMap |
| Backend | Node.js + Express.js |
| Database | MySQL 8 |
| Auth | JWT (jsonwebtoken) |
| Export | SheetJS (xlsx) |
| Date | date-fns |

---

## Struktur Proyek

```
absensi-geolokasi/
├── backend/
│   ├── config/
│   │   └── db.js              # Koneksi MySQL (mysql2/promise)
│   ├── services/
│   │   ├── attendanceService.js        # Logic check-in/check-out + validasi radius
│   │   └── attendanceScheduleService.js # Baca/tulis jadwal kerja
│   ├── routes/                # Express router per fitur
│   ├── middleware/            # JWT auth middleware
│   └── server.js             # Entry point, CORS, semua route
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Login.tsx
    │   │   ├── UserDashboard.tsx   # Halaman utama pegawai
    │   │   └── AdminDashboard.tsx  # Halaman rekap admin
    │   ├── components/
    │   │   ├── user/
    │   │   │   ├── LocationMap.tsx      # Peta Leaflet
    │   │   │   ├── LocationStatus.tsx   # Status GPS & jarak ke kantor
    │   │   │   └── TodayStatus.tsx      # Rekap absensi hari ini
    │   │   └── admin/
    │   │       ├── AttendanceTable.tsx  # Tabel + filter + export
    │   │       └── ...
    │   └── services/
    │       └── api.ts          # Semua HTTP request ke backend
    └── tailwind.config.js
```

---

## Cara Menjalankan

### Prasyarat
- Node.js ≥ 18
- MySQL 8 (atau XAMPP)
- Git

### 1. Clone & Setup Database

```bash
git clone https://github.com/USERNAME/absensi-geolokasi.git
cd absensi-geolokasi
```

Buat database dan import schema:

```sql
-- Di MySQL / phpMyAdmin:
SOURCE backend/database.sql;
```

### 2. Backend

```bash
cd backend
npm install
```

Buat file `.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=db_absensi
JWT_SECRET=your_secret_key_here
PORT=5000
```

```bash
node server.js
# Backend berjalan di http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
# Frontend berjalan di http://localhost:5173
```

---

## Akun Default

Setelah import `database.sql`, akun default tersedia:

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Pegawai | `pegawai1` | `user123` |

> Ganti password setelah pertama kali login.

---

## Cara Kerja Validasi Geofence

```
Jarak = Haversine(koordinat_pegawai, koordinat_kantor)
Jika Jarak ≤ radius_kantor → absen diizinkan
Jika Jarak > radius_kantor → ditolak, tampilkan pesan error
```

Radius default: **100 meter**. Bisa diubah admin dari halaman pengaturan.

Koordinat kantor default di database: `-7.44675476, 109.24140416` (bisa diganti sesuai lokasi kantor nyata).

---

## Screenshot

> *(Tambahkan screenshot aplikasi di sini)*

| Login | Dashboard Pegawai | Dashboard Admin |
|---|---|---|
| ![Login](<img width="457" height="816" alt="Login" src="https://github.com/user-attachments/assets/68cf0b8f-25a1-462a-9f08-19341f41ba15" />) | ![User](<img width="460" height="821" alt="Dashboard Pegawai" src="https://github.com/user-attachments/assets/d48536bd-7f56-4d17-8a64-b1b87b003442" />) | ![Admin](<img width="1193" height="866" alt="Dashboard Admin" src="https://github.com/user-attachments/assets/540b80ad-c446-4ee6-9171-868e9330b19a" />) |

---

## Deployment

**Frontend** → Deploy ke [Vercel](https://vercel.com) (gratis, auto-deploy dari GitHub)

**Backend** → Deploy ke [Railway](https://railway.app) atau [Render](https://render.com)

**Database** → MySQL di Railway / PlanetScale

Jangan lupa ubah URL API di `frontend/src/services/api.ts` dari `localhost:5000` ke URL backend produksi.

---

## Lisensi

© 2026 PBYL. All Rights Reserved.
