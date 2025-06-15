import React from 'react';


function PaymentButton() {
  const makePayment = async () => {
       const response = await fetch('http://localhost:8000/api/payment/create-order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ amount: 50000}),
        });
         const order = await response.json();
         console.log(`\n  Order =${order}\n`);
         const options = {
    key: 'rzp_test_WAl9yKMvDgn7OM', // Replace with your Razorpay key ID
    amount: order.amount,
    currency: order.currency,
    order_id: order.id,
    name: 'Newsly',
    description: 'Test Transaction',
    handler: function (response) {
      alert('Payment successful!');
      console.log(response);
    },
    prefill: {
      name: 'John Doe',
      email: 'john@example.com',
      contact: '9999999999',
    },
    theme: {
      color: '#3399cc',
    },
  };

  const razorpay = new window.Razorpay(options);
  razorpay.open(); //due to <script src="https://checkout.razorpay.com/v1/checkout.js"></script> in index.html

  };

  return <button  onClick={makePayment}>Pay ₹500</button>;
}

export default PaymentButton;
