const express = require('express');
const router = express.Router();
const Store = require('../models/Store');

// Get all stores
router.get('/', async (req, res) => {
  try {
    const stores = await Store.find({ isActive: true });
    console.log(`Sending ${stores.length} stores`);
    res.json(stores);
  } catch (error) {
    console.error('Error getting stores:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get nearby stores (if coordinates provided)
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, maxDistance = 10000 } = req.query; // maxDistance in meters, default 10km

    if (!lat || !lng) {
      const stores = await Store.find({ isActive: true });
      return res.json(stores);
    }

    const stores = await Store.find({
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    });
    
    console.log(`Sending ${stores.length} nearby stores`);
    res.json(stores);
  } catch (error) {
    console.error('Error getting nearby stores:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get a single store
router.get('/:id', async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }
    res.json(store);
  } catch (error) {
    console.error('Error getting store:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 