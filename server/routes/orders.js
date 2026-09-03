const express = require('express');
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');

const router = express.Router();

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Buyer sends an order request
router.post('/', requireAuth, async (req, res) => {
  try {
    const { listing, quantityRequested, message } = req.body;

    const order = new Order({
      listing,
      buyer: req.userId,
      farmer: req.body.farmer,
      quantityRequested,
      message,
    });

    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Could not create order', error: err.message });
  }
});

// Farmer gets all orders for their listings
router.get('/farmer/my-orders', requireAuth, async (req, res) => {
  try {
    const orders = await Order.find({ farmer: req.userId })
      .populate('listing', 'cropName quantity pricePerUnit')
      .populate('buyer', 'name phone email');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch orders', error: err.message });
  }
});

// Farmer updates order status (accept/decline)
router.patch('/:orderId', requireAuth, async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.farmer.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    order.status = status;
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Could not update order', error: err.message });
  }
});

module.exports = router;