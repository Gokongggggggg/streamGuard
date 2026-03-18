const express = require("express");
const authMiddleware = require("../middleware/auth");
const DonationModel = require("../db/donationModel");

const router = express.Router();

function parsePagination(query) {
  const limit = Math.min(Math.max(parseInt(query.limit) || 20, 1), 100);
  const page = Math.max(parseInt(query.page) || 1, 1);
  const offset = (page - 1) * limit;
  return { limit, page, offset };
}

router.get("/", authMiddleware, async (req, res) => {
  const { limit, page, offset } = parsePagination(req.query);
  const [donations, total] = await Promise.all([
    DonationModel.getAll(req.user.id, limit, offset),
    DonationModel.countAll(req.user.id),
  ]);
  res.json({ donations, page, limit, total, totalPages: Math.ceil(total / limit) });
});

router.get("/recent", authMiddleware, async (req, res) => {
  const donations = await DonationModel.getAll(req.user.id, 5, 0);
  res.json({ donations });
});

router.get("/blocked", authMiddleware, async (req, res) => {
  const { limit, page, offset } = parsePagination(req.query);
  const [donations, total] = await Promise.all([
    DonationModel.getBlocked(req.user.id, limit, offset),
    DonationModel.countBlocked(req.user.id),
  ]);
  res.json({ donations, page, limit, total, totalPages: Math.ceil(total / limit) });
});

router.get("/passed", authMiddleware, async (req, res) => {
  const { limit, page, offset } = parsePagination(req.query);
  const [donations, total] = await Promise.all([
    DonationModel.getPassed(req.user.id, limit, offset),
    DonationModel.countPassed(req.user.id),
  ]);
  res.json({ donations, page, limit, total, totalPages: Math.ceil(total / limit) });
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

router.post("/bulk-approve", authMiddleware, async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "ids must be a non-empty array" });
  }
  if (ids.length > 50) {
    return res.status(400).json({ error: "Max 50 donations at once" });
  }

  const results = [];
  for (const id of ids) {
    const donation = await DonationModel.approve(id, req.user.id);
    if (donation) {
      req.app.locals.broadcastToOverlay(req.user.overlay_token, {
        donator: donation.donator_name,
        amount: donation.amount,
        amountDisplay: donation.amount,
        message: donation.message,
        provider: donation.provider,
      });
      results.push(donation);
    }
  }
  res.json({ message: `${results.length} donations approved`, approved: results.length });
});

router.get("/export", authMiddleware, async (req, res) => {
  const donations = await DonationModel.getAll(req.user.id, 10000, 0);
  const header = "ID,Date,Donator,Amount,Message,Status,Filter Reason\n";
  const csvRows = donations.map(d => {
    const status = d.blocked ? (d.manually_approved ? "Approved" : "Blocked") : "Passed";
    const msg = `"${(d.message || "").replace(/"/g, '""')}"`;
    const reason = `"${(d.filter_reason || "").replace(/"/g, '""')}"`;
    return `${d.id},${d.created_at},${d.donator_name},${d.amount},${msg},${status},${reason}`;
  });
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=donations.csv");
  res.send(header + csvRows.join("\n"));
});

module.exports = router;
