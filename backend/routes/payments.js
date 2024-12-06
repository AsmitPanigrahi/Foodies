const express = require('express');
const router = express.Router();

// Create payment intent
router.post('/create-intent', (req, res) => {
  const { amount } = req.body;
  // In a real app, integrate with Stripe here
  res.json({
    clientSecret: 'dummy_client_secret',
    amount
  });
});

// Confirm payment
router.post('/confirm', (req, res) => {
  const { paymentIntentId } = req.body;
  // In a real app, confirm with Stripe here
  res.json({
    success: true,
    paymentIntentId
  });
});

module.exports = router;
