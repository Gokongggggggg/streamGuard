const express = require("express");
const UserModel = require("../db/userModel");
const SaweriaProvider = require("../providers/saweria");
const TrakteerProvider = require("../providers/trakteer");

const router = express.Router();

const saweria = new SaweriaProvider(process.env.SAWERIA_STREAM_KEY || "");
const trakteer = new TrakteerProvider();

// Simple in-memory dedup cache (donationId → timestamp), auto-expire after 5 min
const processedIds = new Map();
const DEDUP_TTL = 5 * 60 * 1000;

function isDuplicate(donationId) {
  if (!donationId) return false;
  if (processedIds.has(donationId)) return true;
  processedIds.set(donationId, Date.now());
  // Cleanup old entries
  if (processedIds.size > 1000) {
    const now = Date.now();
    for (const [id, ts] of processedIds) {
      if (now - ts > DEDUP_TTL) processedIds.delete(id);
    }
  }
  return false;
}

router.post("/saweria/:webhookToken", async (req, res) => {
  try {
    const user = await UserModel.findByWebhookToken(req.params.webhookToken);
    if (!user) {
      return res.status(404).json({ error: "Invalid webhook token" });
    }

    const donation = saweria.parseDonation(req.body);

    if (isDuplicate(donation.id)) {
      console.log(`[Saweria] Duplicate skipped: ${donation.id}`);
      return res.status(200).json({ status: "duplicate" });
    }

    console.log(`[Saweria] ${user.username || user.email}: ${donation.donator} - Rp${donation.amountDisplay} - "${donation.message}"`);

    await req.app.locals.processDonation(user, donation);
    res.status(200).json({ status: "received" });
  } catch (err) {
    console.error("[Webhook] Error:", err.message);
    res.status(500).json({ error: "Processing failed" });
  }
});

router.post("/trakteer/:webhookToken", async (req, res) => {
  try {
    const user = await UserModel.findByWebhookToken(req.params.webhookToken);
    if (!user) {
      return res.status(404).json({ error: "Invalid webhook token" });
    }

    const donation = trakteer.parseDonation(req.body);

    if (isDuplicate(donation.id)) {
      console.log(`[Trakteer] Duplicate skipped: ${donation.id}`);
      return res.status(200).json({ status: "duplicate" });
    }

    console.log(`[Trakteer] ${user.username || user.email}: ${donation.donator} - Rp${donation.amountDisplay} - "${donation.message}"`);

    await req.app.locals.processDonation(user, donation);
    res.status(200).json({ status: "received" });
  } catch (err) {
    console.error("[Webhook] Error:", err.message);
    res.status(500).json({ error: "Processing failed" });
  }
});

module.exports = router;
