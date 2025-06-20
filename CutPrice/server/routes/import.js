const express = require('express');
const router = express.Router();
const multer = require('multer');
const { importDataFromFile } = require('../utils/dataImport');

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/json' || file.originalname.endsWith('.jsonl')) {
      cb(null, true);
    } else {
      cb(new Error('Only JSON and JSONL files are allowed'));
    }
  }
});

// Route to handle file uploads
router.post('/:type', upload.single('file'), async (req, res) => {
  try {
    const { type } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    if (!['products', 'stores'].includes(type)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid data type. Must be either "products" or "stores"' 
      });
    }

    const result = await importDataFromFile(req.file.buffer, type);
    res.json(result);
  } catch (error) {
    console.error('Error processing upload:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process upload',
      error: error.message
    });
  }
});

module.exports = router; 