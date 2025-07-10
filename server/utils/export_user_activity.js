const { User, userActivity } = require("../models/user");

async function exportToCSV() {
  const users = await User.find({});
  const userSet = new Set(users.map(u => u._id.toString()));

  const activities = await userActivity.find({});
  const validActivities = activities.filter(a => userSet.has(a.userId.toString()));

  const rows = validActivities.map(a =>
    `${a.userId},${a.articleUrl},${a.action},${a.timestamp.toISOString()}`
  );

  fs.writeFileSync(
    "user_activity.csv",
    "userId,articleUrl,action,timestamp\n" + rows.join("\n")
  );

  console.log("Exported user activity to user_activity.csv");
  process.exit();
}
