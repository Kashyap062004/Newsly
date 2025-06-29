const {userActivity} = require("../models/user");

async function buildMatrix() {
  const activities = await userActivity.find({});
  const matrix = {};
  activities.forEach(({ userId, articleUrl, action }) => {
    if (!matrix[userId]) matrix[userId] = {};
    if (!matrix[userId][articleUrl]) matrix[userId][articleUrl] = 0;
    if (action === "view") matrix[userId][articleUrl] += 1;
    if (action === "like") matrix[userId][articleUrl] += 3;
    if (action === "bookmark") matrix[userId][articleUrl] += 5;
  });
  return matrix;
}

module.exports = buildMatrix;