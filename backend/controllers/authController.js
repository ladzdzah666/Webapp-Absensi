const UserService = require('../services/userService');

const authController = {
  register: async (req, res) => {
    try {
      const { username, password, full_name } = req.body;
      if (!username || !password || !full_name) {
        return res.status(400).json({ error: "Semua field (username, password, nama lengkap) wajib diisi" });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: "Password minimal 6 karakter" });
      }

      // Selalu set role 'user' untuk registrasi publik
      const result = await UserService.register({
        username: username.trim(),
        password,
        full_name: full_name.trim(),
        role: 'user'
      });

      res.status(201).json({
        message: "User berhasil didaftarkan",
        token: result.token,
        user: {
          id: result.user.id,
          username: result.user.username,
          full_name: result.user.full_name,
          role: result.user.role
        }
      });
    } catch (error) {
      console.error("Error in register:", error);
      res.status(400).json({ error: error.message });
    }
  },

  loginUser: async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username dan password wajib diisi" });
      }

      const result = await UserService.login({
        username: username.trim(),
        password
      });

      res.json({
        message: "Login berhasil",
        token: result.token,
        user: {
          id: result.user.id,
          username: result.user.username,
          full_name: result.user.full_name,
          role: result.user.role
        }
      });
    } catch (error) {
      console.error("Error in login:", error);
      res.status(401).json({ error: error.message });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { username, newPassword } = req.body;
      if (!username || !newPassword) {
        return res.status(400).json({ error: "Username dan password baru wajib diisi" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: "Password baru minimal 6 karakter" });
      }

      await UserService.resetPassword(username.trim(), newPassword);
      res.json({ message: "Password berhasil direset" });
    } catch (error) {
      console.error("Error in resetPassword:", error);
      res.status(400).json({ error: error.message });
    }
  }
};

module.exports = {
  register: authController.register,
  loginUser: authController.loginUser,
  resetPassword: authController.resetPassword
};