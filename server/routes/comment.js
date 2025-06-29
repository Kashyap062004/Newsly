const express = require("express");
const router = express.Router();
const {User,comment} = require("../models/user");
const { authMiddleware } = require("../middlewares/auth");
// Post a comment
router.post("/", authMiddleware, async (req, res) => {
  const { articleUrl, text } = req.body;
  const user = await User.findById(req.user._id);
  const newcomment = await comment.create({
    articleUrl,
    userId: user._id,
    userName: user.name,
    text
  });
  res.json(newcomment);
});

// Get comments for an article
router.get("/:articleUrl", async (req, res) => {
  const { articleUrl } = req.params;
  const comments = await comment.find({ articleUrl }).sort({ createdAt: -1 });
  res.json(comments);
});

router.post("/like/:id", authMiddleware, async (req, res) => {
  const c = await comment.findById(req.params.id);
  if (!c.likes.includes(req.user._id)) {
    c.likes.push(req.user._id);
    await c.save();
  }
  res.json({ likes: c.likes.length });
});

router.post("/reply/:id", authMiddleware, async (req, res) => {
  const c = await comment.findById(req.params.id);
  c.replies.push({
    userId: c._id,
    userName: c.name,
    text: req.body.text
  });
  await c.save();
  res.json(c.replies);
});

module.exports = router;