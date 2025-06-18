const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Product Schema (same as in importData.js)
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  },
  isOrganic: {
    type: Boolean,
    required: true
  },
  store: {
    type: String,
    required: true,
    enum: ['Walmart', 'Costco', 'Indian Store']
  },
  unit: {
    type: String,
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

const Product = mongoose.model('Product', productSchema);

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    console.log(`Sending ${products.length} products`);
    res.json(products);
  } catch (error) {
    console.error('Error getting all products:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get products by store
router.get('/store/:storeName', async (req, res) => {
  try {
    const products = await Product.find({ store: req.params.storeName });
    console.log(`Sending ${products.length} products for store: ${req.params.storeName}`);
    res.json(products);
  } catch (error) {
    console.error('Error getting store products:', error);
    res.status(500).json({ message: error.message });
  }
});

// Search products
router.get('/search', async (req, res) => {
  try {
    const { query, store } = req.query;
    let searchQuery = {};
    
    if (query) {
      searchQuery.name = { $regex: query, $options: 'i' };
    }
    
    if (store) {
      searchQuery.store = store;
    }
    
    const products = await Product.find(searchQuery);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get organic products
router.get('/organic', async (req, res) => {
  try {
    const products = await Product.find({ isOrganic: true });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Compare prices across stores
router.get('/compare/:productName', async (req, res) => {
  try {
    const products = await Product.find({
      name: { $regex: new RegExp(req.params.productName, 'i') }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 