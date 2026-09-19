require("dotenv").config();
const session = require("express-session");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");

const app = express();

// Security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Middleware untuk logging
app.use(morgan("dev"));

// Konfigurasi CORS
app.use(
  cors({
    origin: (origin, callback) => {
      // Izinkan request tanpa origin (seperti mobile app, curl, postman) atau dari localhost / LAN
      if (
        !origin || 
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
        /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(origin)
      ) {
        callback(null, true);
      } else {
        callback(null, true); // Dev-friendly fallback
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Konfigurasi body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Konfigurasi session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "rahasia",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 jam
    },
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/attendance", attendanceRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    message: "Terjadi kesalahan server",
    error: process.env.NODE_ENV === "development" ? err.message : "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});