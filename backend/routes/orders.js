const express = require('express');
const router = express.Router();

// Temporary order storage (replace with MongoDB later)
let orders = [];

// Create order
router.post('/', (req, res) => {
  const { items, totalAmount, deliveryAddress } = req.body;
  const order = {
    id: Date.now().toString(),
    items,
    totalAmount,
    deliveryAddress,
    status: 'pending',
    createdAt: new Date()
  };
  orders.push(order);
  res.status(201).json(order);
});

// Get user orders
router.get('/user', (req, res) => {
  // In a real app, filter by user ID from token
  res.json(orders);
});

// Update order status
router.put('/:id/status', (req, res) => {
  const { status } = req.body;
  const order = orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }
  order.status = status;
  res.json(order);
});

module.exports = router;
