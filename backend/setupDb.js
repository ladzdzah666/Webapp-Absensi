require("dotenv").config();
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

async function setupDatabase() {
  const host = process.env.DB_HOST || "127.0.0.1";
  const user = process.env.DB_USER || "root";
  const password = process.env.DB_PASS || process.env.DB_PASSWORD || "";
  const dbName = process.env.DB_NAME || "db_absensi";
  const port = Number(process.env.DB_PORT) || 3306;

  console.log(`Menghubungkan ke MySQL di ${host}:${port} dengan user '${user}'...`);

  // 1. Buat koneksi awal tanpa nama database
  const connection = await mysql.createConnection({
    host,
    user,
    password,
    port,
  });

  try {
    // 2. Buat database jika belum ada
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✅ Database '${dbName}' siap`);

    // 3. Gunakan database
    await connection.query(`USE \`${dbName}\``);

    // 4. Buat tabel users
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`username\` VARCHAR(100) NOT NULL UNIQUE,
        \`password\` VARCHAR(255) NOT NULL,
        \`full_name\` VARCHAR(255) NOT NULL,
        \`role\` ENUM('admin', 'user') NOT NULL DEFAULT 'user',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // 5. Buat tabel office_location
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`office_location\` (
        \`id\` INT PRIMARY KEY DEFAULT 1,
        \`lat\` DECIMAL(10, 8) NOT NULL DEFAULT -7.44675476,
        \`lng\` DECIMAL(11, 8) NOT NULL DEFAULT 109.24140416,
        \`radius\` INT NOT NULL DEFAULT 100
      ) ENGINE=InnoDB;
    `);

    // 6. Buat tabel attendance_schedule
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`attendance_schedule\` (
        \`id\` INT PRIMARY KEY DEFAULT 1,
        \`check_in_start\` TIME NOT NULL DEFAULT '06:00:00',
        \`check_in_end\` TIME NOT NULL DEFAULT '08:00:00',
        \`check_out_start\` TIME NOT NULL DEFAULT '15:00:00',
        \`check_out_end\` TIME NOT NULL DEFAULT '18:00:00'
      ) ENGINE=InnoDB;
    `);

    // 7. Buat tabel attendance
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`attendance\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`user_id\` INT NOT NULL,
        \`check_in_time\` DATETIME NULL,
        \`check_in_latitude\` DECIMAL(10, 8) NULL,
        \`check_in_longitude\` DECIMAL(11, 8) NULL,
        \`check_out_time\` DATETIME NULL,
        \`check_out_latitude\` DECIMAL(10, 8) NULL,
        \`check_out_longitude\` DECIMAL(11, 8) NULL,
        \`status\` ENUM('present', 'late', 'absent') NOT NULL DEFAULT 'present',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    // 8. Seed lokasi default jika kosong
    const [locations] = await connection.query(`SELECT id FROM \`office_location\` LIMIT 1`);
    if (locations.length === 0) {
      await connection.query(`
        INSERT INTO \`office_location\` (\`id\`, \`lat\`, \`lng\`, \`radius\`) 
        VALUES (1, -7.446754760104717, 109.24140415854745, 100)
      `);
      console.log("✅ Seed lokasi kantor default ditambahkan");
    }

    // 9. Seed jadwal default jika kosong
    const [schedules] = await connection.query(`SELECT id FROM \`attendance_schedule\` LIMIT 1`);
    if (schedules.length === 0) {
      await connection.query(`
        INSERT INTO \`attendance_schedule\` (\`id\`, \`check_in_start\`, \`check_in_end\`, \`check_out_start\`, \`check_out_end\`)
        VALUES (1, '06:00:00', '08:00:00', '15:00:00', '18:00:00')
      `);
      console.log("✅ Seed jadwal default ditambahkan");
    }

    // 10. Seed akun admin jika belum ada
    const [admins] = await connection.query(`SELECT id FROM \`users\` WHERE \`role\` = 'admin' LIMIT 1`);
    if (admins.length === 0) {
      const adminPass = await bcrypt.hash("admin123", 10);
      await connection.query(`
        INSERT INTO \`users\` (\`username\`, \`password\`, \`full_name\`, \`role\`)
        VALUES ('admin', ?, 'Administrator', 'admin')
      `, [adminPass]);
      console.log("✅ Akun admin default dibuat: admin / admin123");
    }

    // 11. Seed akun user jika belum ada
    const [users] = await connection.query(`SELECT id FROM \`users\` WHERE \`role\` = 'user' LIMIT 1`);
    if (users.length === 0) {
      const userPass = await bcrypt.hash("user123", 10);
      await connection.query(`
        INSERT INTO \`users\` (\`username\`, \`password\`, \`full_name\`, \`role\`)
        VALUES ('pegawai1', ?, 'Ahmad Pegawai', 'user')
      `, [userPass]);
      console.log("✅ Akun user default dibuat: pegawai1 / user123");
    }

    console.log("🎉 Inisialisasi database selesai dengan sukses!");
  } finally {
    await connection.end();
  }
}

if (require.main === module) {
  setupDatabase().catch((err) => {
    console.error("❌ Gagal inisialisasi database:", err);
    process.exit(1);
  });
}

module.exports = setupDatabase;
