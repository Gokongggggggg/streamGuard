const express = require("express");
const authMiddleware = require("../middleware/auth");
const DonationModel = require("../db/donationModel");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  const donations = await DonationModel.getAll(req.user.id);
  res.json({ donations });
});

router.get("/blocked", authMiddleware, async (req, res) => {
  const donations = await DonationModel.getBlocked(req.user.id);
  res.json({ donations });
});

router.get("/passed", authMiddleware, async (req, res) => {
  const donations = await DonationModel.getPassed(req.user.id);
  res.json({ donations });
});

router.post("/:id/approve", authMiddleware, async (req, res) => {
  const donation = await DonationModel.approve(req.params.id, req.user.id);
  if (!donation) {
    return res.status(404).json({ error: "Donation not found" });
  }
  req.app.locals.broadcastToOverlay(req.user.overlay_token, {
    donator: donation.donator_name,
    amount: donation.amount,
    amountDisplay: donation.amount,
    message: donation.message,
    provider: donation.provider,
  });
  res.json({ message: "Donation approved and sent to overlay", donation });
});

module.exports = router;
