const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");
const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 10, // Maksimal 10 percobaan per 15 menit
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Terlalu banyak percobaan login. Silakan coba lagi setelah 15 menit." },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 jam
  max: 5, // Maksimal 5 registrasi per jam per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Batas registrasi tercapai. Silakan coba lagi nanti." },
});

router.post("/register", registerLimiter, authController.register);
router.post("/login", loginLimiter, authController.loginUser);
router.post("/reset-password", verifyToken, isAdmin, authController.resetPassword);

module.exports = router;

