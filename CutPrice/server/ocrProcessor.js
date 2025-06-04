const { createWorker } = require('tesseract.js');
const path = require('path');
const fs = require('fs').promises;

class OCRProcessor {
    constructor() {
        this.worker = null;
    }

    async initialize() {
        if (!this.worker) {
            this.worker = await createWorker();
            await this.worker.loadLanguage('eng');
            await this.worker.initialize('eng');
        }
    }

    async processImage(imagePath) {
        try {
            await this.initialize();
            const { data: { text } } = await this.worker.recognize(imagePath);
            return this.parseReceiptText(text);
        } catch (error) {
            console.error('Error processing image:', error);
            throw error;
        }
    }

    parseReceiptText(text) {
        // Split text into lines
        const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
        
        // Initialize receipt data structure
        const receiptData = {
            date: null,
            storeName: null,
            items: [],
            total: null,
            tax: null
        };

        // Regular expressions for matching
        const dateRegex = /(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})/;
        const totalRegex = /total[:\s]*[$]?\s*(\d+\.?\d*)/i;
        const taxRegex = /tax[:\s]*[$]?\s*(\d+\.?\d*)/i;
        const priceRegex = /[$]?\s*(\d+\.?\d*)/;

        // Process each line
        lines.forEach((line, index) => {
            // Try to find date
            if (!receiptData.date && dateRegex.test(line)) {
                receiptData.date = line.match(dateRegex)[1];
            }
            
            // Try to find store name (usually in first 3 lines)
            if (!receiptData.storeName && index < 3) {
                receiptData.storeName = line;
            }

            // Try to find total
            if (totalRegex.test(line.toLowerCase())) {
                receiptData.total = parseFloat(line.match(totalRegex)[1]);
            }

            // Try to find tax
            if (taxRegex.test(line.toLowerCase())) {
                receiptData.tax = parseFloat(line.match(taxRegex)[1]);
            }

            // If line has a price, assume it's an item
            if (priceRegex.test(line) && !line.toLowerCase().includes('total') && !line.toLowerCase().includes('tax')) {
                const price = parseFloat(line.match(priceRegex)[1]);
                const itemName = line.replace(priceRegex, '').trim();
                if (itemName && price) {
                    receiptData.items.push({ name: itemName, price });
                }
            }
        });

        return receiptData;
    }

    async terminate() {
        if (this.worker) {
            await this.worker.terminate();
            this.worker = null;
        }
    }
}

module.exports = new OCRProcessor(); 