-- Database Schema untuk Sistem Absensi Geolokasi
CREATE DATABASE IF NOT EXISTS `db_absensi` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `db_absensi`;

-- Tabel Pengguna (Admin & Karyawan)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabel Lokasi Kantor
CREATE TABLE IF NOT EXISTS `office_location` (
  `id` INT PRIMARY KEY DEFAULT 1,
  `lat` DECIMAL(10, 8) NOT NULL DEFAULT -7.44675476,
  `lng` DECIMAL(11, 8) NOT NULL DEFAULT 109.24140416,
  `radius` INT NOT NULL DEFAULT 100
) ENGINE=InnoDB;

-- Tabel Jadwal Absensi
CREATE TABLE IF NOT EXISTS `attendance_schedule` (
  `id` INT PRIMARY KEY DEFAULT 1,
  `check_in_start` TIME NOT NULL DEFAULT '06:00:00',
  `check_in_end` TIME NOT NULL DEFAULT '08:00:00',
  `check_out_start` TIME NOT NULL DEFAULT '15:00:00',
  `check_out_end` TIME NOT NULL DEFAULT '18:00:00'
) ENGINE=InnoDB;

-- Tabel Kehadiran
CREATE TABLE IF NOT EXISTS `attendance` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `check_in_time` DATETIME NULL,
  `check_in_latitude` DECIMAL(10, 8) NULL,
  `check_in_longitude` DECIMAL(11, 8) NULL,
  `check_out_time` DATETIME NULL,
  `check_out_latitude` DECIMAL(10, 8) NULL,
  `check_out_longitude` DECIMAL(11, 8) NULL,
  `status` ENUM('present', 'late', 'absent') NOT NULL DEFAULT 'present',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Data Awal: Lokasi Default
INSERT INTO `office_location` (`id`, `lat`, `lng`, `radius`) 
VALUES (1, -7.446754760104717, 109.24140415854745, 100)
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Data Awal: Jadwal Default
INSERT INTO `attendance_schedule` (`id`, `check_in_start`, `check_in_end`, `check_out_start`, `check_out_end`)
VALUES (1, '06:00:00', '08:00:00', '15:00:00', '18:00:00')
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Data Awal: Akun Admin Default (Password: admin123)
-- Hash bcrypt: $2b$10$aZSuPVv0R2a0w9s1aAHYge5tL9rXCh5Wv28oSiU2aXwJOTSz9D/wa
INSERT INTO `users` (`username`, `password`, `full_name`, `role`)
VALUES ('admin', '$2b$10$aZSuPVv0R2a0w9s1aAHYge5tL9rXCh5Wv28oSiU2aXwJOTSz9D/wa', 'Administrator', 'admin')
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Data Awal: Akun Pegawai Default (Password: user123)
-- Hash bcrypt: $2b$10$TN3DWYHSYxCET5SfPqEFNOqqYO0Aef10QLoTm6u5zCyR7nh1N/3Ca
INSERT INTO `users` (`username`, `password`, `full_name`, `role`)
VALUES ('pegawai1', '$2b$10$TN3DWYHSYxCET5SfPqEFNOqqYO0Aef10QLoTm6u5zCyR7nh1N/3Ca', 'Ahmad Pegawai', 'user')
ON DUPLICATE KEY UPDATE `id`=`id`;
