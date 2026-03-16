const express = require("express");
const UserModel = require("../db/userModel");
const SaweriaProvider = require("../providers/saweria");
const TrakteerProvider = require("../providers/trakteer");

const router = express.Router();

const saweria = new SaweriaProvider("");
const trakteer = new TrakteerProvider();

router.post("/saweria/:webhookToken", async (req, res) => {
  try {
    const user = await UserModel.findByWebhookToken(req.params.webhookToken);
    if (!user) {
      return res.status(404).json({ error: "Invalid webhook token" });
    }

    const donation = saweria.parseDonation(req.body);
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
    console.log(`[Trakteer] ${user.username || user.email}: ${donation.donator} - Rp${donation.amountDisplay} - "${donation.message}"`);

    await req.app.locals.processDonation(user, donation);
    res.status(200).json({ status: "received" });
  } catch (err) {
    console.error("[Webhook] Error:", err.message);
    res.status(500).json({ error: "Processing failed" });
  }
});

module.exports = router;
