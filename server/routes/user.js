const express = require("express");
const { handleUserSignup,handleUserLogin,handleVerifyOtp } = require("../controllers/user");
const router = express.Router();
const passport = require("passport");

router.post('/', handleUserSignup);
router.post('/login', handleUserLogin);
router.post('/verify-otp', handleVerifyOtp);
const { setUser,getUser } = require("../service/auth");
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

const nodemailer = require("nodemailer");
const { setOtp, getOtp, deleteOtp } = require("../service/otpStore");
const {User} = require("../models/user");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: 'http://localhost:3000', // or your login page
    session: true
  }),
  (req, res) => {
    // Set JWT cookie for frontend
    if (req.user._isNewGoogleUser) {
    req.session.showWelcome = true;
  }
    const token = setUser(req.user);
    res.cookie("uid", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false
    });
    // Redirect to frontend
    res.redirect('http://localhost:3000');
  }
);


// Middleware to get user from JWT
function authMiddleware(req, res, next) {
  const token = req.cookies?.uid;
  if (!token) return res.status(401).json({ error: "Not authenticated" });
  const user = getUser(token);
  if (!user) return res.status(401).json({ error: "Invalid token" });
  req.user = user;
  next();
}

// Like an article
router.post('/like', authMiddleware, async (req, res) => {
  const { article } = req.body; // article is an object
  const user = await User.findOne({ email: req.user.email });
  if (!user) return res.status(404).json({ error: "User not found" });

  // Remove from dislikes if present
  user.dislikedArticles = user.dislikedArticles.filter(a => a.url !== article.url);
  // Toggle like
  if (user.likedArticles.some(a => a.url === article.url)) {
    user.likedArticles = user.likedArticles.filter(a => a.url !== article.url);
  } else {
    user.likedArticles.push(article);
  }
  await user.save();
  res.json({ likedArticles: user.likedArticles });
});

// Bookmark an article
router.post('/bookmark', authMiddleware, async (req, res) => {
  const { article } = req.body;
  const user = await User.findOne({ email: req.user.email });
  if (!user) return res.status(404).json({ error: "User not found" });

  // Toggle bookmark
  if (user.bookmarkedArticles.some(a => a.url === article.url)) {
    user.bookmarkedArticles = user.bookmarkedArticles.filter(a => a.url !== article.url);
  } else {
    user.bookmarkedArticles.push(article);
  }
  await user.save();
  res.json({ bookmarkedArticles: user.bookmarkedArticles });
});

function authMiddleware(req, res, next) {
  const token = req.cookies?.uid;
  if (!token) return res.status(401).json({ error: "Not authenticated" });
  const user = getUser(token);
  if (!user) return res.status(401).json({ error: "Invalid token" });
  req.user = user;
  next();
}

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  const user = await User.findOne({ email: req.user.email }).select("-password");
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    subscribe: user.subscribe,
    subscriptionExpires: user.subscriptionExpires,
  });
});

// Get liked articles
router.get('/liked', authMiddleware, async (req, res) => {
  const user = await User.findOne({ email: req.user.email });
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ likedArticles: user.likedArticles });
});

// Get bookmarked articles
router.get('/bookmarks', authMiddleware, async (req, res) => {
  const user = await User.findOne({ email: req.user.email });
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ bookmarkedArticles: user.bookmarkedArticles });
});

// Delete a bookmarked article
router.delete('/bookmark', authMiddleware, async (req, res) => {
  const { url } = req.body;
  const user = await User.findOne({ email: req.user.email });
  if (!user) return res.status(404).json({ error: "User not found" });

  user.bookmarkedArticles = user.bookmarkedArticles.filter(a => a.url !== url);
  await user.save();
  res.json({ bookmarkedArticles: user.bookmarkedArticles });
});

// Delete a liked article
router.delete('/like', authMiddleware, async (req, res) => {
  const { url } = req.body;
  const user = await User.findOne({ email: req.user.email });
  if (!user) return res.status(404).json({ error: "User not found" });

  user.likedArticles = user.likedArticles.filter(a => a.url !== url);
  await user.save();
  res.json({ likedArticles: user.likedArticles });
});

// Upload avatar
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Make sure this folder exists
  },
  filename: function (req, file, cb) {
    cb(null, req.user.email + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.post(
  "/avatar",
  authMiddleware,
  upload.single("avatar"),
  async (req, res) => {
    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ error: "User not found" });
    user.avatarUrl = `/uploads/${req.file.filename}`;
    await user.save();
    res.json({ avatarUrl: user.avatarUrl });
  }
);

// Update user name (email cannot be changed)
router.put('/profile', authMiddleware, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });
  const user = await User.findOne({ email: req.user.email });
  if (!user) return res.status(404).json({ error: "User not found" });
  user.name = name;
  await user.save();
  res.json({ name: user.name });
});
router.post('/change-password', authMiddleware, async (req, res) => {
  const { old, new: newPassword } = req.body;
  if (!old || !newPassword) return res.status(400).json({ error: "Both old and new password required" });
  const user = await User.findOne({ email: req.user.email });
  if (!user) return res.status(404).json({ error: "User not found" });
  if (user.password !== old) return res.status(400).json({ error: "Old password is incorrect" });
  user.password = newPassword;
  await user.save();
  res.json({ success: true });
});
router.get('/stats', authMiddleware, async (req, res) => {
  const user = await User.findOne({ email: req.user.email });
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({
    liked: user.likedArticles.length,
    bookmarked: user.bookmarkedArticles.length,
    read: user.likedArticles.length + user.bookmarkedArticles.length // or however you track "read"
  });
});


// Send OTP for forgot password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  setOtp(email, otp);

  // Send OTP email
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "kashyap.trivedi2004@gmail.com",
      pass: "qpoa vkzo mrnn sqzo", // use your app password
    },
  });

  await transporter.sendMail({
    from: "kashyap.trivedi2004@gmail.com",
    to: email,
     subject: "Newsly Password Reset - OTP Verification",
  text: `Dear ${user.name},

We received a request to reset your password on Newsly.

Your One-Time Password (OTP) for password reset is: ${otp}

Please enter this OTP to proceed with resetting your password. Do not share this code with anyone.

If you did not request a password reset, please ignore this email or contact support.

Best regards,  
The Newsly Team`
  });

  res.json({ message: "An OTP has been sent to your registered email address" });
});

// Reset password with OTP
router.post('/reset-password', async (req, res) => {
  const { email, otp, password } = req.body;
  const record = getOtp(email);
  if (!record) return res.status(400).json({ error: "OTP expired or not found" });
  if (record.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found" });
  user.password = password;
  await user.save();
  deleteOtp(email);
  res.json({ message: "Password reset successful" });
});
router.post('/interests', authMiddleware, async (req, res) => {
  const { interests } = req.body;
  if (!Array.isArray(interests) || interests.length < 3) {
    return res.status(400).json({ error: "Select at least 3 interests." });
  }

  // Find the user document and update interests
  const user = await User.findOne({ email: req.user.email });
  if (!user) return res.status(404).json({ error: "User not found" });
  
  user.interests = interests;
  await user.save(); // Save the user document

  res.json({ success: true });
});
module.exports = router;
