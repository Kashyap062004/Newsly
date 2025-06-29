import React from "react";
const razorpayKey = process.env.REACT_APP_RAZOR_PAY_KEY;
export default function PaymentButton({ email }) {
  const handlePayment = async () => {
    const res = await fetch("http://localhost:8000/api/payment/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: 50000 }), // Rs. 500
    });

    const order = await res.json();
    console.log("Order =", order);

    const options = {
      key: razorpayKey, // replace with your Razorpay test key
      amount: order.amount,
      currency: "INR",
      name: "Newsly Subscription",
      description: "Unlimited chatbot access",
      order_id: order.id,
      handler: async function (response) {
        try {
          const verifyRes = await fetch("http://localhost:8000/api/payment/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              email,
            }),
          });

          const data = await verifyRes.json();

          if (data.success) {
            alert("✅ Payment successful! Subscription activated.");
            window.location.reload(); // reload Profile to reflect updated status
          } else {
            alert("❌ Payment verification failed.");
          }
        } catch (err) {
          console.error("Error verifying payment", err);
        }
      },
      prefill: {
        email: email,
      },
      theme: {
        color: "#3399cc",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <button onClick={handlePayment} className="profile-btn">
      Subscribe ₹500
    </button>
  );
}
