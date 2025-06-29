const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    likedArticles: [mongoose.Schema.Types.Mixed],
    dislikedArticles: [mongoose.Schema.Types.Mixed],
    bookmarkedArticles: [mongoose.Schema.Types.Mixed],
    avatarUrl: { type: String, default: "" },
    interests: { type: [String], default: [] }, // <-- FIXED: closed the bracket here
    subscribe: { type: Boolean, default: false },
    requestsToday: { type: Number, default: 0 },
    lastRequestDate: { type: Date, default: null },
    subscriptionExpiry: { type: Date, },
}, { timestamps: true });
const userActivitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  articleUrl: String,
  action: { type: String, enum: ["view", "like", "bookmark"], default: "view" },
  timestamp: { type: Date, default: Date.now },
});

const commentSchema = new mongoose.Schema({
  articleUrl: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  userName: String, // for display
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  replies: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      userName: String,
      text: String,
      createdAt: { type: Date, default: Date.now }
    }
  ]
});
const User = mongoose.model('user', userSchema);
const userActivity=mongoose.model('userActivity',userActivitySchema)
const comment=mongoose.model('comment',commentSchema)
module.exports = {User,userActivity,comment};