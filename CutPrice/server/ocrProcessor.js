const { createWorker } = require('tesseract.js');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs').promises;

class OCRProcessor {
    constructor() {
        this.worker = null;
        this.isInitialized = false;
        this.initPromise = null;
        this.debugMode = process.env.NODE_ENV === 'development';
    }

    async preprocessImage(imagePath) {
        try {
            const processedPath = imagePath + '_processed.png';
            
            // Process the image
            await sharp(imagePath)
                .resize(2000, null, { // Resize to reasonable width while maintaining aspect ratio
                    withoutEnlargement: true,
                    fit: 'inside'
                })
                .normalize() // Normalize contrast
                .sharpen() // Sharpen edges
                .threshold(128) // Convert to black and white
                .toFile(processedPath);

            return processedPath;
        } catch (error) {
            console.error('Image preprocessing failed:', error);
            return imagePath; // Fall back to original image
        }
    }

    async saveDebugImage(imagePath, suffix) {
        if (!this.debugMode) return;
        
        try {
            const debugDir = path.join('debug', 'ocr');
            await fs.mkdir(debugDir, { recursive: true });
            
            const filename = path.basename(imagePath);
            const debugPath = path.join(debugDir, `${filename}_${suffix}`);
            await fs.copyFile(imagePath, debugPath);
            
            console.log(`Saved debug image: ${debugPath}`);
        } catch (error) {
            console.error('Failed to save debug image:', error);
        }
    }

    async initialize() {
        if (this.isInitialized) return;
        if (this.initPromise) return this.initPromise;

        this.initPromise = (async () => {
            try {
                this.worker = await createWorker();
                await this.worker.loadLanguage('eng');
                await this.worker.initialize('eng');
                this.isInitialized = true;
                console.log('OCR processor initialized successfully');
            } catch (error) {
                console.error('Failed to initialize OCR processor:', error);
                this.isInitialized = false;
                this.worker = null;
                throw error;
            }
        })();

        return this.initPromise;
    }

    parseReceiptText(text) {
        console.log('Raw OCR text:', text);

        // Filter out common error messages and runtime logs
        const errorPatterns = [
            /\[runtime not ready\]/i,
            /TypeError:/i,
            /ReferenceError:/i,
            /Cannot read property/i,
            /undefined/i,
            /DISMISS/i,
            /RELOAD/i,
            /stack:/i,
            /js engine:/i,
            /hermes/i,
            /@\d+:\d+/,  // Stack trace lines like @134495:77
            /metro/i
        ];

        // Split text into lines and clean them
        let lines = text.split(/[\r\n]+/)
            .map(line => line.trim())
            .filter(line => {
                // Remove empty lines and single characters
                if (!line || line.length <= 1) return false;
                
                // Filter out error messages and logs
                if (errorPatterns.some(pattern => pattern.test(line))) {
                    console.log('Filtering out error/log line:', line);
                    return false;
                }
                
                return true;
            });

        console.log('Cleaned lines:', lines);
        
        let items = [];
        let storeName = '';
        let date = '';

        // Try to find store name (usually at the top)
        const invalidStorePatterns = [
            /^\d{1,2}:\d{2}/,  // Time format like 3:08
            /^[0-9.:%]+$/,     // Just numbers and symbols
            /^unknown/i,        // Unknown store
            /battery/i,         // Battery indicator
            /loading/i,         // Loading messages
            /error/i           // Error messages
        ];

        for (let i = 0; i < Math.min(5, lines.length); i++) {
            const line = lines[i];
            if (line.length > 3 && 
                !invalidStorePatterns.some(pattern => pattern.test(line))) {
                storeName = line;
                console.log('Found store name:', storeName);
                break;
            }
        }

        // Try to find date (look for common date formats)
        const dateRegex = /\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}/;
        const dateRegex2 = /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}/i;
        const dateRegex3 = /\d{4}[-/.]\d{1,2}[-/.]\d{1,2}/;  // YYYY-MM-DD format
        
        for (const line of lines) {
            let match = line.match(dateRegex) || 
                       line.match(dateRegex2) || 
                       line.match(dateRegex3);
            
            if (match) {
                const potentialDate = match[0];
                // Validate the date is reasonable (not too far in future/past)
                const dateObj = new Date(potentialDate);
                const now = new Date();
                const oneYearAgo = new Date();
                oneYearAgo.setFullYear(now.getFullYear() - 1);
                const oneYearAhead = new Date();
                oneYearAhead.setFullYear(now.getFullYear() + 1);

                if (dateObj >= oneYearAgo && dateObj <= oneYearAhead) {
                    date = potentialDate;
                    console.log('Found valid date:', date);
                    break;
                } else {
                    console.log('Skipping invalid date:', potentialDate);
                }
            }
        }

        // Process each line as a potential item
        const skipPatterns = [
            /total/i,
            /subtotal/i,
            /tax/i,
            /change/i,
            /cash/i,
            /card/i,
            /balance/i,
            /amount/i,
            /tel:/i,
            /phone/i,
            /\d{3}-\d{3}-\d{4}/,  // Phone numbers
            /error/i,
            /warning/i,
            /undefined/i,
            /^[0-9.:%]+$/,  // Lines with just numbers and symbols
            /receipt/i,
            /store/i,
            /location/i,
            /address/i,
            /thank you/i,
            /welcome/i,
            /^\s*$/  // Empty lines
        ];

        // Start processing from line after store name
        const startIndex = storeName ? lines.indexOf(storeName) + 1 : 0;
        
        for (let i = startIndex; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Skip lines that match any skip patterns
            if (skipPatterns.some(pattern => pattern.test(line))) {
                console.log('Skipping line:', line);
                continue;
            }

            // Clean the line
            let itemName = line
                .replace(/^\d+\s*x\s*/, '')  // Remove quantity prefixes
                .replace(/^[^a-zA-Z0-9]+/, '')  // Remove leading special chars
                .replace(/[^a-zA-Z0-9\s-&]+$/, '')  // Remove trailing special chars
                .trim();

            // Add as item if it's a valid name
            if (itemName && 
                itemName.length > 1 && 
                !/^\d+$/.test(itemName) &&  // Not just numbers
                !errorPatterns.some(pattern => pattern.test(itemName))) {
                console.log('Found item:', itemName);
                items.push({
                    name: itemName,
                    price: null  // Price is not required
                });
            }
        }

        const result = {
            storeName: storeName || 'Unknown Store',
            date: date || new Date().toLocaleDateString(),
            items: items
        };

        console.log('Final parsed result:', result);
        return result;
    }

    async processImage(imagePath) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            console.log('Processing image:', imagePath);
            
            // Save original image for debugging
            await this.saveDebugImage(imagePath, 'original');

            // Preprocess the image
            const processedPath = await this.preprocessImage(imagePath);
            await this.saveDebugImage(processedPath, 'processed');

            // Perform OCR
            const { data: { text } } = await this.worker.recognize(processedPath);

            // Check if this looks like an error screenshot
            const errorIndicators = [
                'runtime not ready',
                'TypeError:',
                'ReferenceError:',
                'Cannot read property',
                'undefined',
                'DISMISS',
                'RELOAD',
                'stack:',
                'js engine:',
                'hermes',
                '@[0-9]+:[0-9]+',  // Stack trace line numbers
                'metro'
            ];

            const errorCount = errorIndicators.reduce((count, indicator) => {
                return count + (new RegExp(indicator, 'i').test(text) ? 1 : 0);
            }, 0);

            if (errorCount >= 2) {  // If we find multiple error indicators
                console.error('Detected error screenshot instead of receipt');
                return {
                    success: false,
                    error: 'Invalid receipt image',
                    details: 'It looks like you uploaded a screenshot of an error message instead of a receipt. ' +
                            'Please make sure to upload a clear photo of your receipt.',
                    originalText: text
                };
            }

            // Parse the receipt text into structured data
            const receiptData = this.parseReceiptText(text);

            // Additional validation of parsed data
            if (!receiptData.items || receiptData.items.length === 0) {
                // Check if the text contains mostly error-like content
                const lines = text.split('\n').map(line => line.trim()).filter(line => line);
                const errorLines = lines.filter(line => 
                    errorIndicators.some(indicator => new RegExp(indicator, 'i').test(line))
                );

                if (errorLines.length > lines.length * 0.3) {  // If more than 30% of lines look like errors
                    return {
                        success: false,
                        error: 'Invalid receipt content',
                        details: 'The image appears to contain error messages or debug information instead of receipt data. ' +
                                'Please take a clear photo of your receipt.',
                        originalText: text
                    };
                }

                // If not an error screenshot, give more specific feedback about the receipt
                return {
                    success: false,
                    error: 'No items found in receipt',
                    details: 'Could not find any items with prices in this image. Please ensure:\n' +
                            '• The receipt is well-lit and not blurry\n' +
                            '• The entire receipt is visible\n' +
                            '• Prices are clearly readable\n' +
                            '• The image is not a screenshot or error message',
                    originalText: text,
                    partialData: {
                        storeName: receiptData.storeName,
                        date: receiptData.date
                    }
                };
            }

            // Clean up processed image
            if (processedPath !== imagePath) {
                await fs.unlink(processedPath).catch(console.error);
            }

            return {
                success: true,
                ...receiptData,
                originalText: text
            };
        } catch (error) {
            console.error('OCR processing error:', error);
            return {
                success: false,
                error: error.message,
                details: 'An error occurred while processing the receipt. Please try again with a clearer photo.',
                storeName: 'Unknown Store',
                date: new Date().toLocaleDateString(),
                items: [],
                originalText: ''
            };
        }
    }

    async terminate() {
        if (this.worker) {
            try {
            await this.worker.terminate();
            } catch (error) {
                console.error('Error terminating OCR worker:', error);
            } finally {
            this.worker = null;
                this.isInitialized = false;
                this.initPromise = null;
            }
        }
    }
}

// Create a singleton instance
const ocrProcessor = new OCRProcessor();

// Handle process termination
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, cleaning up OCR processor...');
    await ocrProcessor.terminate();
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, cleaning up OCR processor...');
    await ocrProcessor.terminate();
});

module.exports = ocrProcessor;