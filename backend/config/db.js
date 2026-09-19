require("dotenv").config();

const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "db_absensi",
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test koneksi database
db.getConnection()
  .then((connection) => {
    console.log("✅ Koneksi database berhasil");
    connection.release();
  })
  .catch((err) => {
    console.error("❌ Gagal terhubung ke database:", err.message);
  });

module.exports = db;
