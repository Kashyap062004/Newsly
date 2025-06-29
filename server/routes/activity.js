const express = require("express");
const router = express.Router();
const {userActivity} = require("../models/user");
const { getUser } = require("../service/auth");

// Middleware to authenticate user
function authMiddleware(req, res, next) {
  const token = req.cookies?.uid;
  if (!token) return res.status(401).json({ error: "Not authenticated" });
  const user = getUser(token);
  if (!user) return res.status(401).json({ error: "Invalid token" });
  req.user = user;
  next();
}

// Log user activity
router.post("/", authMiddleware, async (req, res) => {
  const { articleUrl, action } = req.body;
  await userActivity.create({
    userId: req.user._id,
    articleUrl,
    action: action || "view",
  });
  res.json({ success: true });
});

module.exports = router;