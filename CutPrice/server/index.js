const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const ocrProcessor = require('./ocrProcessor');
const excelGenerator = require('./excelGenerator');

const app = express();
const DEFAULT_PORT = 3001;
let server = null;

// Configure paths
const UPLOAD_PATH = path.join('E:', 'LocalStorage');
const EXCEL_PATH = path.join('E:', 'LocalStorage', 'excel_exports');

// Configure multer for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create directory if it doesn't exist
    if (!fs.existsSync(UPLOAD_PATH)) {
      fs.mkdirSync(UPLOAD_PATH, { recursive: true });
    }
    cb(null, UPLOAD_PATH);
  },
  filename: function (req, file, cb) {
    cb(null, 'receipt_' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOAD_PATH));
app.use('/excel', express.static(EXCEL_PATH));

// Routes
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const imagePath = req.file.path;
    const receiptData = await ocrProcessor.processImage(imagePath);

    const fileUrl = `/uploads/${path.basename(imagePath)}`;
    res.json({
      success: true,
      data: receiptData,
      file: {
        url: fileUrl,
        path: imagePath,
        filename: path.basename(imagePath)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.get('/images', (req, res) => {
  try {
    const files = fs.readdirSync(UPLOAD_PATH)
      .filter(file => file.endsWith('.jpg') || file.endsWith('.png'))
      .map(filename => ({
        filename,
        url: `/uploads/${filename}`,
        timestamp: fs.statSync(path.join(UPLOAD_PATH, filename)).mtime
      }));
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: 'Error listing images' });
  }
});

app.post('/api/process-bill', upload.single('image'), async (req, res) => {
  try {
    // Validate request
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No image file provided',
        details: 'Please select an image to process'
      });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/heic'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      // Clean up invalid file
      await fs.promises.unlink(req.file.path).catch(console.error);
      
      return res.status(400).json({
        success: false,
        error: 'Invalid file type',
        details: 'Please upload a valid image file (JPEG, PNG, or HEIC)'
      });
    }

    console.log('Processing bill from image:', req.file.path);
    const receiptData = await ocrProcessor.processImage(req.file.path);

    // Clean up the uploaded file
    await fs.promises.unlink(req.file.path).catch(err => {
      console.error('Cleanup error:', err);
    });

    if (!receiptData.success) {
      console.error('OCR processing failed:', receiptData.error);
      return res.status(422).json({ 
        success: false,
        error: 'OCR processing failed',
        details: receiptData.error,
        debug: {
          originalText: receiptData.originalText
        }
      });
    }

    if (!receiptData.items || receiptData.items.length === 0) {
      console.error('No items found in receipt. Original text:', receiptData.originalText);
      return res.status(422).json({
        success: false,
        error: 'No items found in receipt',
        details: 'The OCR process could not identify any items with prices in the receipt. ' +
                'Please make sure the receipt image is clear, well-lit, and contains readable prices.',
        debug: {
          originalText: receiptData.originalText,
          storeName: receiptData.storeName,
          date: receiptData.date
        }
      });
    }

    // Success response
    res.json({
      success: true,
      data: receiptData
    });
  } catch (error) {
    console.error('Processing failed:', error);
    
    // Clean up file on error
    if (req.file) {
      await fs.promises.unlink(req.file.path).catch(console.error);
    }

    res.status(500).json({ 
      success: false,
      error: 'Processing failed',
      details: error.message
    });
  }
});

app.post('/api/generate-excel', async (req, res) => {
  try {
    // Validate request body
    if (!req.body) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid request',
        details: 'Request body is missing'
      });
    }

    if (!req.body.items || !Array.isArray(req.body.items)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid data',
        details: 'Items must be provided as an array'
      });
    }

    if (req.body.items.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid data',
        details: 'Items array cannot be empty'
      });
    }

    // Validate each item
    const invalidItems = req.body.items.filter(item => 
      !item.name || 
      typeof item.name !== 'string' ||
      !item.price ||
      typeof item.price !== 'number' ||
      item.price <= 0
    );

    if (invalidItems.length > 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid items',
        details: 'Each item must have a name (string) and price (positive number)',
        invalidItems
      });
    }

    const result = await excelGenerator.generateExcel(req.body);
    res.json({ 
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error generating Excel:', error);
    res.status(500).json({ 
      success: false,
      error: 'Excel generation failed',
      details: error.message
    });
  }
});

// Delete image endpoint
app.delete('/delete-image/:id', async (req, res) => {
  try {
    const imageId = req.params.id;
    console.log('Received delete request for image:', imageId);

    // Check for valid image ID
    if (!imageId) {
      console.error('Invalid image ID received');
      return res.status(400).json({ error: 'Invalid image ID' });
    }

    // Try to find the image with different extensions
    const possibleExtensions = ['.jpg', '.jpeg', '.png'];
    let imagePath = null;
    let imageExists = false;

    for (const ext of possibleExtensions) {
      const testPath = path.join(UPLOAD_PATH, `${imageId}${ext}`);
      if (fs.existsSync(testPath)) {
        imagePath = testPath;
        imageExists = true;
        break;
      }
    }

    if (!imageExists) {
      console.log('Image not found:', imageId);
      return res.status(404).json({ error: 'Receipt not found' });
    }

    console.log('Found image at path:', imagePath);

    // Delete the image file
    try {
      await fs.promises.unlink(imagePath);
      console.log('Successfully deleted image:', imagePath);
    } catch (unlinkError) {
      console.error('Error deleting image file:', unlinkError);
      throw new Error('Failed to delete image file');
    }

    // Try to delete associated Excel file
    try {
      const excelFilename = `receipt_${imageId}.xlsx`;
      const excelPath = path.join(EXCEL_PATH, excelFilename);
      
      if (fs.existsSync(excelPath)) {
        await fs.promises.unlink(excelPath);
        console.log('Successfully deleted Excel file:', excelPath);
      }
    } catch (excelError) {
      // Log but don't fail if Excel deletion fails
      console.warn('Non-critical error deleting Excel file:', excelError);
    }

    res.json({ 
      success: true, 
      message: 'Receipt deleted successfully',
      deletedFiles: {
        image: path.basename(imagePath)
      }
    });

  } catch (error) {
    console.error('Error in delete endpoint:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to delete receipt',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Graceful shutdown function
async function shutdown() {
  console.log('\nShutting down server...');
  
  if (server) {
    await new Promise((resolve) => {
      server.close(resolve);
    });
  }
  
  // Cleanup resources
  await ocrProcessor.terminate();
  
  console.log('Server shutdown complete');
  process.exit(0);
}

// Handle shutdown signals
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start server with automatic port selection
async function startServer(port = DEFAULT_PORT) {
  try {
    server = app.listen(port, '0.0.0.0', () => {
      console.log(`Server running on port ${port}`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.log(`Port ${port} is in use, trying ${port + 1}...`);
        server.close();
        startServer(port + 1);
      } else {
        console.error('Server error:', error);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer(); 