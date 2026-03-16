const express = require("express");
const authMiddleware = require("../middleware/auth");
const UserModel = require("../db/userModel");

const router = express.Router();

router.post("/filter", authMiddleware, async (req, res) => {
  const { enabled } = req.body;
  await UserModel.toggleFilter(req.user.id, enabled);
  res.json({ filter_enabled: enabled });
});

module.exports = router;
