/**
 * StreamGuard — Main Server (v0.2 - Multi-user + Database)
 */

require("dotenv").config();
const express = require("express");
const http = require("http");
const { WebSocketServer } = require("ws");
const path = require("path");
const fs = require("fs");

const { filterMessage } = require("./filters/judolFilter");
const UserModel = require("./db/userModel");
const DonationModel = require("./db/donationModel");
const BlocklistModel = require("./db/blocklistModel");
const authMiddleware = require("./middleware/auth");

// Routes
const authRoutes = require("./routes/auth");
const webhookRoutes = require("./routes/webhooks");
const donationRoutes = require("./routes/donations");
const blocklistRoutes = require("./routes/blocklist");
const settingsRoutes = require("./routes/settings");

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

// Serve built dashboard
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
  const customBlocklist = await BlocklistModel.getWords(user.id);

  let filterResult;
  if (user.filter_enabled) {
    filterResult = filterMessage(donation.message, customBlocklist);
  } else {
    filterResult = { blocked: false, reason: "filter disabled", confidence: 1.0, layer: "none" };
  }

  await DonationModel.save(user.id, donation, filterResult);

  if (filterResult.blocked) {
    console.log(`[BLOCKED] [${user.username || user.email}] "${donation.message}" → ${filterResult.reason}`);
  } else {
    console.log(`[PASSED] [${user.username || user.email}] "${donation.message}" → clean`);
    broadcastToOverlay(user.overlay_token, donation);
  }

  return filterResult;
}

// Share functions with routes via app.locals
app.locals.processDonation = processDonation;
app.locals.broadcastToOverlay = broadcastToOverlay;

// ══════════════════════════════════════════
// MOUNT ROUTES
// ══════════════════════════════════════════

app.use("/api/auth", authRoutes);
app.use("/webhook", webhookRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/blocklist", blocklistRoutes);
app.use("/api/settings", settingsRoutes);

// /api/me
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

// Overlay
app.get("/overlay", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "overlay.html"));
});

// Health
app.get("/health", (req, res) => {
  res.json({ status: "ok", version: "0.2.0", overlayConnections: overlayClients.size });
});

// Test donation
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
// SPA CATCH-ALL + START
// ══════════════════════════════════════════

const dashIndexPath = path.join(dashboardDist, "index.html");
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
