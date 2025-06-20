const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

class ExcelGenerator {
    constructor() {
        this.exportsPath = path.join('E:', 'LocalStorage', 'excel_exports');
        this.initialize();
    }

    async initialize() {
        try {
            if (!fs.existsSync(this.exportsPath)) {
                await fs.promises.mkdir(this.exportsPath, { recursive: true });
            }
        } catch (error) {
            console.error('Error initializing Excel generator:', error);
            throw error;
        }
    }

    validateData(receiptData) {
        if (!receiptData || typeof receiptData !== 'object') {
            throw new Error('Receipt data must be an object');
        }

        if (!Array.isArray(receiptData.items)) {
            throw new Error('Receipt items must be an array');
        }

        if (receiptData.items.length === 0) {
            throw new Error('Receipt must contain at least one item');
        }

        // Validate each item
        receiptData.items.forEach((item, index) => {
            if (!item.name) {
                throw new Error(`Item at index ${index} must have a name`);
            }

            // Clean up item name
            item.name = item.name.trim();
            if (item.name.length < 1) {
                throw new Error(`Item at index ${index} has an empty name`);
            }
        });

        return {
            ...receiptData,
            date: receiptData.date || new Date().toLocaleDateString(),
            storeName: receiptData.storeName || 'Unknown Store'
        };
    }

    async generateExcel(receiptData) {
        try {
            console.log('Validating receipt data...');
            const validatedData = this.validateData(receiptData);
            console.log('Receipt data validated successfully');
            
            await this.initialize();
            
            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'CutPrice App';
            workbook.created = new Date();
            
            const sheet = workbook.addWorksheet('Receipt Details');

            // Setup columns
            sheet.columns = [
                { header: 'Date', key: 'date', width: 15 },
                { header: 'Store', key: 'store', width: 20 },
                { header: 'Item Name', key: 'item', width: 50 },
                { header: 'Notes', key: 'notes', width: 30 }
            ];

            // Style the header
            sheet.getRow(1).font = { bold: true };
            sheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE0E0E0' }
            };

            // Add items data
            validatedData.items.forEach((item) => {
                sheet.addRow({
                    date: validatedData.date,
                    store: validatedData.storeName,
                    item: item.name,
                    notes: ''  // Empty notes column for manual entry
                });
            });

            // Add empty row
            sheet.addRow([]);

            // Add summary
            const totalRow = sheet.addRow({
                date: 'TOTAL ITEMS',
                store: '',
                item: validatedData.items.length.toString(),
                notes: ''
            });
            totalRow.font = { bold: true };

            // Generate filename using timestamp and store name
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const storeName = validatedData.storeName.replace(/[^a-zA-Z0-9]/g, '_');
            const filename = `receipt_${storeName}_${timestamp}.xlsx`;
            
            const filePath = path.join(this.exportsPath, filename);
            console.log('Saving Excel file to:', filePath);

            await workbook.xlsx.writeFile(filePath);
            console.log('Excel file generated successfully');
            
            return {
                filePath,
                filename,
                url: `/excel/${filename}`,
                summary: {
                    totalItems: validatedData.items.length,
                    storeName: validatedData.storeName,
                    date: validatedData.date
                }
            };
        } catch (error) {
            console.error('Error generating Excel:', error);
            throw error;
        }
    }
}

module.exports = new ExcelGenerator(); 