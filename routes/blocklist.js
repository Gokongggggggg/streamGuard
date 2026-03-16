const express = require("express");
const authMiddleware = require("../middleware/auth");
const BlocklistModel = require("../db/blocklistModel");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  const words = await BlocklistModel.getWords(req.user.id);
  res.json({ words });
});

router.post("/", authMiddleware, async (req, res) => {
  const { word } = req.body;
  if (!word) return res.status(400).json({ error: "Word required" });
  await BlocklistModel.addWord(req.user.id, word);
  const words = await BlocklistModel.getWords(req.user.id);
  res.json({ words });
});

router.delete("/:word", authMiddleware, async (req, res) => {
  await BlocklistModel.removeWord(req.user.id, req.params.word);
  const words = await BlocklistModel.getWords(req.user.id);
  res.json({ words });
});

module.exports = router;
