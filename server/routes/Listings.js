const express = require('express');
const jwt = require('jsonwebtoken');
const Listing = require('../models/Listing');

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

router.post('/', requireAuth, async (req, res) => {
  try {
    const { cropName, quantity, unit, pricePerUnit, location, description, photoUrl } = req.body;

    const listing = new Listing({
      farmer: req.userId,
      cropName,
      quantity,
      unit,
      pricePerUnit,
      location,
      description,
      photoUrl,
    });

    await listing.save();
    res.status(201).json(listing);
  } catch (err) {
    res.status(500).json({ message: 'Could not create listing', error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { crop, location } = req.query;
    const filter = { status: 'available' };

    if (crop) filter.cropName = { $regex: crop, $options: 'i' };
    if (location) filter.location = { $regex: location, $options: 'i' };

    const listings = await Listing.find(filter)
      .populate('farmer', 'name phone location')
      .sort({ createdAt: -1 });

    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch listings', error: err.message });
  }
});

router.get('/mine', requireAuth, async (req, res) => {
  try {
    const listings = await Listing.find({ farmer: req.userId }).sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch your listings', error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('farmer', 'name phone location');
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch listing', error: err.message });
  }
});

module.exports = router;