const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

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
app.post('/upload', upload.single('image'), (req, res) => {
    try {
        let filename;
        let imageUrl;

        if (req.file) {
            // Regular file upload
            filename = req.file.filename;
            imageUrl = `http://localhost:${port}/images/${filename}`;
        } else if (req.body.image && req.body.image.uri && req.body.image.uri.startsWith('data:image')) {
            // Base64 image upload
            filename = req.body.image.name;
            const filePath = saveBase64Image(req.body.image.uri, filename);
            imageUrl = `http://localhost:${port}/images/${filename}`;
        } else {
            return res.status(400).json({ error: 'No valid image data provided' });
        }
        
        res.json({
            success: true,
            imageUrl: imageUrl,
            filename: filename
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

// Start server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Storage directory: ${storageDir}`);
}); 