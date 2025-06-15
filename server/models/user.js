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
    lastRequestDate: { type: Date, default: null }
}, { timestamps: true });

const User = mongoose.model('user', userSchema);
module.exports = User;