/**
 * StreamGuard — Main Server (v0.2 - Multi-user + Database)
 * 
 * Changes from v0.1:
 *   - PostgreSQL database for persistent storage
 *   - Multi-user: each streamer gets unique webhook + overlay URLs
 *   - Auth endpoints (register/login)
 *   - Per-user custom blocklist
 *   - Per-user donation history
 */

require("dotenv").config();
const express = require("express");
const http = require("http");
const { WebSocketServer } = require("ws");
const path = require("path");

const SaweriaProvider = require("./providers/saweria");
const TrakteerProvider = require("./providers/trakteer");
const { filterMessage } = require("./filters/judolFilter");
const UserModel = require("./db/userModel");
const DonationModel = require("./db/donationModel");
const BlocklistModel = require("./db/blocklistModel");

// ══════════════════════════════════════════
// CONFIG
// ══════════════════════════════════════════

const PORT = process.env.PORT || 3000;

// ══════════════════════════════════════════
// EXPRESS + HTTP SERVER
// ══════════════════════════════════════════

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Serve built dashboard (after: cd dashboard && npm run build)
const dashboardDist = path.join(__dirname, "dashboard", "dist");
app.use(express.static(dashboardDist));

// ══════════════════════════════════════════
// WEBSOCKET SERVER
// ══════════════════════════════════════════

const wss = new WebSocketServer({ server });

// Track overlay clients per user: { overlayToken: Set<WebSocket> }
const overlayClients = new Map();

wss.on("connection", (ws) => {
  let userToken = null;

  ws.on("message", (data) => {
    try {
      const msg = JSON.parse(data);
      if (msg.type === "overlay" && msg.token) {
        userToken = msg.token;
        if (!overlayClients.has(userToken)) {
          overlayClients.set(userToken, new Set());
        }
        overlayClients.get(userToken).add(ws);
        console.log(`[WS] Overlay connected for token ${userToken.slice(0, 8)}... (${overlayClients.get(userToken).size} clients)`);
      }
    } catch (e) {}
  });

  ws.on("close", () => {
    if (userToken && overlayClients.has(userToken)) {
      overlayClients.get(userToken).delete(ws);
      if (overlayClients.get(userToken).size === 0) {
        overlayClients.delete(userToken);
      }
    }
  });
});

/**
 * Broadcast donation to a specific user's overlay clients
 */
function broadcastToOverlay(overlayToken, donation) {
  const clients = overlayClients.get(overlayToken);
  if (!clients) return;

  const payload = JSON.stringify({
    type: "donation",
    donation: {
      donator: donation.donator,
      amount: donation.amountDisplay || donation.amount,
      message: donation.message,
      provider: donation.provider,
    },
  });

  for (const client of clients) {
    if (client.readyState === 1) {
      client.send(payload);
    }
  }
}

// ══════════════════════════════════════════
// DONATION PROCESSING PIPELINE
// ══════════════════════════════════════════

async function processDonation(user, donation) {
  // Get user's custom blocklist
  const customBlocklist = await BlocklistModel.getWords(user.id);

  // Run through NLP filter (skip if user disabled filter)
  let filterResult;
  if (user.filter_enabled) {
    filterResult = filterMessage(donation.message, customBlocklist);
  } else {
    filterResult = { blocked: false, reason: "filter disabled", confidence: 1.0, layer: "none" };
  }

  // Save to database
  await DonationModel.save(user.id, donation, filterResult);

  if (filterResult.blocked) {
    console.log(`[BLOCKED] [${user.username || user.email}] "${donation.message}" \u2192 ${filterResult.reason}`);
  } else {
    console.log(`[PASSED] [${user.username || user.email}] "${donation.message}" \u2192 clean`);
    broadcastToOverlay(user.overlay_token, donation);
  }

  return filterResult;
}

// ══════════════════════════════════════════
// AUTH ROUTES
// ══════════════════════════════════════════

app.post("/api/auth/register", async (req, res) => {
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

app.post("/api/auth/login", async (req, res) => {
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

// ══════════════════════════════════════════
// WEBHOOK ROUTES (multi-user)
// ══════════════════════════════════════════

const saweria = new SaweriaProvider("");
const trakteer = new TrakteerProvider();

app.post("/webhook/saweria/:webhookToken", async (req, res) => {
  try {
    const user = await UserModel.findByWebhookToken(req.params.webhookToken);
    if (!user) {
      return res.status(404).json({ error: "Invalid webhook token" });
    }

    const donation = saweria.parseDonation(req.body);
    console.log(`[Saweria] ${user.username || user.email}: ${donation.donator} - Rp${donation.amountDisplay} - "${donation.message}"`);

    await processDonation(user, donation);
    res.status(200).json({ status: "received" });
  } catch (err) {
    console.error("[Webhook] Error:", err.message);
    res.status(500).json({ error: "Processing failed" });
  }
});

// Trakteer webhook
app.post("/webhook/trakteer/:webhookToken", async (req, res) => {
  try {
    const user = await UserModel.findByWebhookToken(req.params.webhookToken);
    if (!user) {
      return res.status(404).json({ error: "Invalid webhook token" });
    }

    const donation = trakteer.parseDonation(req.body);
    console.log(`[Trakteer] ${user.username || user.email}: ${donation.donator} - Rp${donation.amountDisplay} - "${donation.message}"`);

    await processDonation(user, donation);
    res.status(200).json({ status: "received" });
  } catch (err) {
    console.error("[Webhook] Error:", err.message);
    res.status(500).json({ error: "Processing failed" });
  }
});

// ══════════════════════════════════════════
// OVERLAY ROUTE
// ══════════════════════════════════════════

app.get("/overlay", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "overlay.html"));
});

// ══════════════════════════════════════════
// API ROUTES (per-user)
// ══════════════════════════════════════════

// Simple auth middleware (production: use JWT)
async function authMiddleware(req, res, next) {
  const userId = req.headers["x-user-id"];
  if (!userId) {
    return res.status(401).json({ error: "Not authenticated. Send x-user-id header." });
  }
  const user = await UserModel.findById(parseInt(userId));
  if (!user) {
    return res.status(401).json({ error: "User not found" });
  }
  req.user = user;
  next();
}

// My info + stats
app.get("/api/me", authMiddleware, async (req, res) => {
  const stats = await DonationModel.getStats(req.user.id);
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      username: req.user.username,
      filter_enabled: req.user.filter_enabled,
      webhook_token: req.user.webhook_token,
      overlay_token: req.user.overlay_token,
      webhook_url: `/webhook/saweria/${req.user.webhook_token}`,
      overlay_url: `/overlay?token=${req.user.overlay_token}`,
    },
    stats,
  });
});

// Donations
app.get("/api/donations", authMiddleware, async (req, res) => {
  const donations = await DonationModel.getAll(req.user.id);
  res.json({ donations });
});

app.get("/api/donations/blocked", authMiddleware, async (req, res) => {
  const donations = await DonationModel.getBlocked(req.user.id);
  res.json({ donations });
});

app.get("/api/donations/passed", authMiddleware, async (req, res) => {
  const donations = await DonationModel.getPassed(req.user.id);
  res.json({ donations });
});

// Approve blocked donation
app.post("/api/donations/:id/approve", authMiddleware, async (req, res) => {
  const donation = await DonationModel.approve(req.params.id, req.user.id);
  if (!donation) {
    return res.status(404).json({ error: "Donation not found" });
  }
  broadcastToOverlay(req.user.overlay_token, {
    donator: donation.donator_name,
    amount: donation.amount,
    amountDisplay: donation.amount,
    message: donation.message,
    provider: donation.provider,
  });
  res.json({ message: "Donation approved and sent to overlay", donation });
});

// Filter toggle
app.post("/api/settings/filter", authMiddleware, async (req, res) => {
  const { enabled } = req.body;
  await UserModel.toggleFilter(req.user.id, enabled);
  res.json({ filter_enabled: enabled });
});

// Blocklist CRUD
app.get("/api/blocklist", authMiddleware, async (req, res) => {
  const words = await BlocklistModel.getWords(req.user.id);
  res.json({ words });
});

app.post("/api/blocklist", authMiddleware, async (req, res) => {
  const { word } = req.body;
  if (!word) return res.status(400).json({ error: "Word required" });
  await BlocklistModel.addWord(req.user.id, word);
  const words = await BlocklistModel.getWords(req.user.id);
  res.json({ words });
});

app.delete("/api/blocklist/:word", authMiddleware, async (req, res) => {
  await BlocklistModel.removeWord(req.user.id, req.params.word);
  const words = await BlocklistModel.getWords(req.user.id);
  res.json({ words });
});

// ══════════════════════════════════════════
// HEALTH + TEST
// ══════════════════════════════════════════

app.get("/health", (req, res) => {
  res.json({ status: "ok", version: "0.2.0", overlayConnections: overlayClients.size });
});

app.post("/test/donation/:webhookToken", async (req, res) => {
  try {
    const user = await UserModel.findByWebhookToken(req.params.webhookToken);
    if (!user) {
      return res.status(404).json({ error: "Invalid webhook token. Register first." });
    }

    const testDonation = {
      provider: "test",
      id: "test-" + Date.now(),
      donator: req.body.donator || "TestUser",
      amount: req.body.amount || 10000,
      amountDisplay: req.body.amount || 10000,
      message: req.body.message || "Test donation message",
      rawData: req.body,
      receivedAt: new Date(),
    };

    const filterResult = await processDonation(user, testDonation);
    res.json({ status: "processed", filterResult });
  } catch (err) {
    console.error("[Test] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════
// START
// ══════════════════════════════════════════

// SPA catch-all — serve dashboard for non-API routes
const fs = require("fs");
const dashIndexPath = path.join(__dirname, "dashboard", "dist", "index.html");
app.get("*", (req, res) => {
  if (fs.existsSync(dashIndexPath)) {
    res.sendFile(dashIndexPath);
  } else {
    res.status(404).send("Dashboard not built. Run: cd dashboard && npm run build");
  }
});

server.listen(PORT, () => {
  console.log("");
  console.log("═══════════════════════════════════════════");
  console.log("  StreamGuard MVP Server v0.2 (Multi-user)");
  console.log("═══════════════════════════════════════════");
  console.log(`  Server:     http://localhost:${PORT}`);
  console.log(`  Health:     http://localhost:${PORT}/health`);
  console.log("");
  console.log("  Setup:");
  console.log("  1. Run: node db/init.js");
  console.log("  2. POST /api/auth/register to create account");
  console.log("  3. Paste webhook_url in Saweria Integration");
  console.log("  4. Add overlay_url as OBS Browser Source");
  console.log("═══════════════════════════════════════════");
  console.log("");
});
