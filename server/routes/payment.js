const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');

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


// Verify payment
router.post('/verify',async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature,email } = req.body;
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;

  const expectedSignature = crypto
    .createHmac('sha256', razorpay.key_secret)
    .update(body.toString())
    .digest('hex');

  if (expectedSignature === razorpay_signature) {
    await User.updateOne({ email }, { subscribe: true });
    res.json({ success: true, message: "Payment verified successfully" });
  } else {
    res.status(400).json({ success: false, message: "Payment verification failed" });
  }
});





module.exports = router;

