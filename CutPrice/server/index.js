require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const ocrProcessor = require('./ocrProcessor');
const excelGenerator = require('./excelGenerator');
const mongoose = require('mongoose');
const productRoutes = require('./routes/products');
const storeRoutes = require('./routes/stores');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Create storage directories if they don't exist
const storageDir = path.join('E:', 'LocalStorage');
const excelDir = path.join(storageDir, 'excel_exports');

try {
    // Test write permissions by creating directories
    if (!fs.existsSync(storageDir)) {
        fs.mkdirSync(storageDir, { recursive: true });
        console.log('Main storage directory created at:', storageDir);
    }
    
    if (!fs.existsSync(excelDir)) {
        fs.mkdirSync(excelDir, { recursive: true });
        console.log('Excel directory created at:', excelDir);
    }
    
    // Test write permissions by creating and removing a test file
    const testFile = path.join(storageDir, 'test.txt');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    
    console.log('Storage directories verified with write permissions:');
    console.log('Storage directory:', storageDir);
    console.log('Excel directory:', excelDir);
} catch (error) {
    console.error('Error with storage directories:', error);
    console.error('Please ensure the application has write permissions to:', storageDir);
    process.exit(1); // Exit if we can't create/write to essential directories
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Double-check directory exists before saving
        if (!fs.existsSync(storageDir)) {
            fs.mkdirSync(storageDir, { recursive: true });
        }
        cb(null, storageDir);
    },
    filename: function (req, file, cb) {
        const timestamp = Date.now();
        const ext = path.extname(file.originalname) || '.jpg';
        cb(null, `receipt_${timestamp}${ext}`);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Accept only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Helper function to save base64 image
const saveBase64Image = (base64Data, filename) => {
    try {
        const base64Image = base64Data.split(';base64,').pop();
        const filePath = path.join(storageDir, filename);
        
        // Ensure directory exists before writing
        if (!fs.existsSync(storageDir)) {
            fs.mkdirSync(storageDir, { recursive: true });
        }
        
        fs.writeFileSync(filePath, base64Image, { encoding: 'base64' });
        console.log('Base64 image saved successfully:', filePath);
        return filePath;
    } catch (error) {
        console.error('Error saving base64 image:', error);
        throw error;
    }
};

// Serve static files from the storage directory
app.use('/images', express.static(storageDir));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Upload endpoint
app.post('/upload', upload.single('image'), async (req, res) => {
    try {
        let filename;
        let imageUrl;
        let filePath;

        console.log('Starting upload processing...');
        console.log('Request body:', req.body);
        console.log('Request file:', req.file);

        if (req.file) {
            // Regular file upload
            filename = req.file.filename;
            imageUrl = `http://localhost:${port}/images/${filename}`;
            filePath = req.file.path;
            console.log('Received file upload:', filename);
        } else if (req.body.image && req.body.image.uri && req.body.image.uri.startsWith('data:image')) {
            // Base64 image upload
            const timestamp = Date.now();
            const ext = req.body.image.name ? path.extname(req.body.image.name) : '.jpg';
            filename = `receipt_${timestamp}${ext}`;
            filePath = saveBase64Image(req.body.image.uri, filename);
            imageUrl = `http://localhost:${port}/images/${filename}`;
            console.log('Received base64 image:', filename);
        } else {
            console.log('Invalid upload request');
            return res.status(400).json({ 
                error: 'No valid image data provided',
                body: req.body,
                file: req.file 
            });
        }

        // Process the new receipt image immediately
        let receiptData = null;
        let excelFile = null;
        try {
            console.log('Processing receipt with OCR:', filePath);
            receiptData = await ocrProcessor.processImage(filePath);
            console.log('OCR Result:', receiptData);

            if (receiptData) {
                console.log('Generating Excel file for receipt...');
                const excelPath = await excelGenerator.generateExcel(receiptData);
                excelFile = path.basename(excelPath);
                console.log('Excel file generated:', excelFile);
            }
        } catch (error) {
            console.error('Processing error:', error);
            // Continue even if processing fails
        }
        
        res.json({
            success: true,
            imageUrl: imageUrl,
            filename: filename,
            receiptProcessed: receiptData !== null,
            excelFile: excelFile
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ 
            error: 'Failed to upload file',
            message: error.message
        });
    }
});

// Get all images
app.get('/images', (req, res) => {
    try {
        const files = fs.readdirSync(storageDir);
        const images = files
            .filter(file => ['.jpg', '.jpeg', '.png'].includes(path.extname(file).toLowerCase()))
            .map(file => ({
                filename: file,
                url: `http://localhost:${port}/images/${file}`,
                timestamp: fs.statSync(path.join(storageDir, file)).mtime
            }));
        res.json(images);
    } catch (error) {
        console.error('Error getting images:', error);
        res.status(500).json({ error: 'Failed to get images' });
    }
});

// Process receipts and generate Excel
app.post('/process-receipts', async (req, res) => {
    try {
        const { type = 'daily' } = req.body; // type can be 'daily', 'weekly', or 'monthly'
        
        // Get all image files
        const files = fs.readdirSync(storageDir);
        const imageFiles = files.filter(file => 
            ['.jpg', '.jpeg', '.png'].includes(path.extname(file).toLowerCase())
        );

        // Process each image with OCR
        const receiptsData = [];
        for (const file of imageFiles) {
            const imagePath = path.join(storageDir, file);
            try {
                const receiptData = await ocrProcessor.processImage(imagePath);
                if (receiptData) {
                    receiptsData.push(receiptData);
                }
            } catch (error) {
                console.error(`Error processing image ${file}:`, error);
                // Continue with other images even if one fails
            }
        }

        // Generate Excel file
        const excelFilePath = await excelGenerator.generateExcel(receiptsData, type);
        
        res.json({
            success: true,
            message: 'Excel file generated successfully',
            excelFile: path.basename(excelFilePath),
            processedReceipts: receiptsData.length
        });
    } catch (error) {
        console.error('Error processing receipts:', error);
        res.status(500).json({ error: 'Failed to process receipts' });
    }
});

// Download Excel file
app.get('/download-excel/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(excelDir, filename);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Excel file not found' });
        }

        res.download(filePath);
    } catch (error) {
        console.error('Error downloading Excel file:', error);
        res.status(500).json({ error: 'Failed to download Excel file' });
    }
});

// Routes
app.use('/api/products', productRoutes);
app.use('/api/stores', storeRoutes);

// MongoDB Connection
const MONGODB_URI = 'mongodb://localhost:27017/cutprice';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB at:', MONGODB_URI);
  console.log('Testing database connection...');
  return mongoose.connection.db.admin().ping();
})
.then(() => {
  console.log('MongoDB connection is healthy');
  console.log('Available collections:', 
    mongoose.connection.db.listCollections().toArray()
    .then(collections => collections.map(c => c.name))
    .then(names => console.log('Collections:', names))
  );
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Basic error handling
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

// Basic test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Start server
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Listen on all network interfaces

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
  console.log(`For local access: http://localhost:${PORT}`);
  console.log(`For network access: http://10.0.0.169:${PORT}`);
}); 