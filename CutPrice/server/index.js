const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const ocrProcessor = require('./ocrProcessor');
const excelGenerator = require('./excelGenerator');

const app = express();
const port = 3000;

// Enable CORS
app.use(cors());
// Increase payload size limit for base64 images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Create storage directory if it doesn't exist
const storageDir = 'E:\\LocalStorage';
if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, storageDir);
    },
    filename: function (req, file, cb) {
        const timestamp = Date.now();
        cb(null, `receipt_${timestamp}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });

// Helper function to save base64 image
const saveBase64Image = (base64Data, filename) => {
    const base64Image = base64Data.split(';base64,').pop();
    const filePath = path.join(storageDir, filename);
    fs.writeFileSync(filePath, base64Image, { encoding: 'base64' });
    return filePath;
};

// Serve static files from the storage directory
app.use('/images', express.static(storageDir));

// Upload endpoint
app.post('/upload', upload.single('image'), async (req, res) => {
    try {
        let filename;
        let imageUrl;
        let filePath;

        console.log('Starting upload processing...');

        if (req.file) {
            // Regular file upload
            filename = req.file.filename;
            imageUrl = `http://localhost:${port}/images/${filename}`;
            filePath = req.file.path;
            console.log('Received file upload:', filename);
        } else if (req.body.image && req.body.image.uri && req.body.image.uri.startsWith('data:image')) {
            // Base64 image upload
            filename = req.body.image.name;
            filePath = saveBase64Image(req.body.image.uri, filename);
            imageUrl = `http://localhost:${port}/images/${filename}`;
            console.log('Received base64 image:', filename);
        } else {
            console.log('Invalid upload request');
            return res.status(400).json({ error: 'No valid image data provided' });
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
        res.status(500).json({ error: 'Failed to upload file' });
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
        const filePath = path.join('E:', 'LocalStorage', 'excel_exports', filename);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Excel file not found' });
        }

        res.download(filePath);
    } catch (error) {
        console.error('Error downloading Excel file:', error);
        res.status(500).json({ error: 'Failed to download Excel file' });
    }
});

// Start server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Storage directory: ${storageDir}`);
}); 