const mongoose = require("mongoose");
const fs = require("fs");
const { userActivity } = require("../models/user");

require("dotenv").config(); // Make sure your .env is loaded

mongoose.connect(process.env.MONGO_URI);

async function exportToCSV() {
  const activities = await userActivity.find({});
  const rows = activities.map(a =>
    `${a.userId},${a.articleUrl},${a.action},${a.timestamp.toISOString()}`
  );
  fs.writeFileSync("user_activity.csv", "userId,articleUrl,action,timestamp\n" + rows.join("\n"));
  console.log("Exported user activity to user_activity.csv");
  process.exit();
}

exportToCSV();