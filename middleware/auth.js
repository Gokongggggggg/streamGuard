const UserModel = require("../db/userModel");

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

module.exports = authMiddleware;
