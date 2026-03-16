const express = require("express");
const UserModel = require("../db/userModel");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const user = await UserModel.register(email, password, username);

    res.status(201).json({
      message: "Registration successful",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        webhook_url: `/webhook/saweria/${user.webhook_token}`,
        overlay_url: `/overlay?token=${user.overlay_token}`,
      },
    });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Email already registered" });
    }
    console.error("[Auth] Register error:", err.message);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const user = await UserModel.login(email, password);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        webhook_token: user.webhook_token,
        overlay_token: user.overlay_token,
        filter_enabled: user.filter_enabled,
        webhook_url: `/webhook/saweria/${user.webhook_token}`,
        overlay_url: `/overlay?token=${user.overlay_token}`,
      },
    });
  } catch (err) {
    console.error("[Auth] Login error:", err.message);
    res.status(500).json({ error: "Login failed" });
  }
});

module.exports = router;
