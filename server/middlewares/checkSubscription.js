const { User } = require("../models/user");

const checkSubscription = async (req, res, next) => {
  const userEmail = req.user?.email || req.body?.email || req.query?.email;

  if (!userEmail) return res.status(400).json({ error: "Email is required" });

  const user = await User.findOne({ email: userEmail });
  if (!user) return res.status(404).json({ error: "User not found" });

  const now = new Date();

  if (user.requestsToday > 10 && (!user.subscribe || !user.subscriptionExpiry || user.subscriptionExpiry < now)) {
    // Optional: auto-unsubscribe if expired
    await User.updateOne({ email: userEmail }, { subscribe: false });

    return res.json({ 
        response: "You have reached your daily limit. Please subscribe for unlimited access.", 
        showPay: true 
    });
  }

  next();
};

module.exports = checkSubscription;
