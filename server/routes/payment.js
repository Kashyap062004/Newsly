const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { User } = require('../models/user');
const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_CLIENT_ID,
  key_secret: process.env.RAZORPAY_CLIENT_SECRET,
});

// Create order
router.post('/create-order', async (req, res) => {
  const options = {
    amount: Number(req.body.amount),
    currency: 'INR',
    receipt: 'receipt_' + Date.now(),
  };
  console.log("Razorpay order options:", options);
  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error("Razorpay error:", JSON.stringify(err, null, 2));
    res.status(500).send(err);
  }
});
const thirtyDaysLater = new Date();
thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

// Verify payment
router.post('/verify',async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature,email } = req.body;
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;

  const expectedSignature = crypto
    .createHmac('sha256', razorpay.key_secret)
    .update(body.toString())
    .digest('hex');

  if (expectedSignature === razorpay_signature) {
    await User.updateOne({ email }, { subscribe: true,subscriptionExpiry: thirtyDaysLater});
    console.log("Updating subscription for:", email);

    res.json({ success: true, message: "Payment verified successfully" });
  } else {
    res.status(400).json({ success: false, message: "Payment verification failed" });
  }
});
// router.post('/webhook', (req, res) => {
//   const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
//   const signature = req.headers['x-razorpay-signature'];

//   const digest = crypto
//     .createHmac('sha256', secret)
//     .update(req.body)
//     .digest('hex');

//   if (digest !== signature) {
//     console.log("❌ Invalid webhook signature");
//     return res.status(400).send('Invalid signature');
//   }

//   let payload;
//   try {
//     payload = JSON.parse(req.body.toString('utf8'));
//   } catch (err) {
//     console.error("Failed to parse webhook body:", err);
//     return res.status(400).send("Invalid payload");
//   }


//   const email = payload?.payload?.payment?.entity?.email || payload?.payload?.payment?.entity?.notes?.email;

//   if (email) {
//     User.updateOne({ email }, { subscribe: true })
//       .then(() => {
//         console.log(`✅ Subscription updated for: ${email}`);
//       })
//       .catch(err => {
//         console.error("DB Update Error:", err);
//       });
//   } else {
//     console.log("⚠️ Email not found in webhook payload");
//   }

//   return res.status(200).json({ status: 'ok' });
// });
router.post('/webhook', (req, res) => {
  console.log("🔔 Webhook hit!");

  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  const digest = crypto
    .createHmac('sha256', secret)
    .update(req.body)
    .digest('hex');

  if (digest !== signature) {
    console.log("❌ Invalid webhook signature");
    return res.status(400).send('Invalid signature');
  }

  console.log("✅ Webhook signature verified");

  const payload = JSON.parse(req.body.toString());
  console.log("📦 Webhook Payload:", payload);

 const email = payload?.payload?.payment?.entity?.email || payload?.payload?.payment?.entity?.notes?.email;

    

  console.log("📧 Extracted Email:", email);

  if (email) {
    User.updateOne({ email }, { subscribe: true })
      .then(() => {
        console.log(`✅ Subscription updated for: ${email}`);
      })
      .catch(err => {
        console.error("❌ DB Update Error:", err);
      });
  } else {
    console.log("⚠️ Email not found in webhook payload");
  }

  return res.status(200).json({ status: 'ok' });
});




module.exports = router;

