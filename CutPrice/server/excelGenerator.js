const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs').promises;

class ExcelGenerator {
    constructor() {
        this.exportsPath = path.join('E:', 'LocalStorage', 'excel_exports');
    }

    async initialize() {
        try {
            await fs.mkdir(this.exportsPath, { recursive: true });
        } catch (error) {
            console.error('Error creating exports directory:', error);
            throw error;
        }
    }

    async generateExcel(receiptData) {
        await this.initialize();
        
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Receipt Details');

        // Setup columns
        sheet.columns = [
            { header: 'Date', key: 'date', width: 15 },
            { header: 'Item Name', key: 'item', width: 30 },
            { header: 'Original Price', key: 'originalPrice', width: 15 },
            { header: 'Discounted Price', key: 'price', width: 15 },
            { header: 'Savings', key: 'savings', width: 15 }
        ];

        // Style the header
        sheet.getRow(1).font = { bold: true };
        sheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        // Add items data
        let totalAmount = 0;
        let totalSavings = 0;
        let rowIndex = 2; // Start after header

        if (receiptData.items && receiptData.items.length > 0) {
            receiptData.items.forEach(item => {
                // Simulate original price (20% higher than actual price for demo)
                // You can adjust this logic based on your needs
                const originalPrice = parseFloat((item.price * 1.2).toFixed(2));
                const savings = parseFloat((originalPrice - item.price).toFixed(2));
                
                sheet.addRow({
                    date: receiptData.date || new Date().toLocaleDateString(),
                    item: item.name,
                    originalPrice: originalPrice,
                    price: item.price,
                    savings: savings
                });

                totalAmount += item.price;
                totalSavings += savings;
            });
            rowIndex += receiptData.items.length;
        }

        // Add empty row
        sheet.addRow([]);
        rowIndex++;

        // Add totals with bold formatting
        const totalRow = sheet.addRow({
            date: 'TOTAL',
            item: '',
            originalPrice: totalAmount + totalSavings,
            price: totalAmount,
            savings: totalSavings
        });
        totalRow.font = { bold: true };
        
        // Add border above total row
        ['A', 'B', 'C', 'D', 'E'].forEach(col => {
            sheet.getCell(`${col}${rowIndex - 1}`).border = {
                top: { style: 'thin' }
            };
        });

        // Format numbers to show currency
        for (let i = 2; i <= rowIndex; i++) {
            ['C', 'D', 'E'].forEach(col => {
                const cell = sheet.getCell(`${col}${i}`);
                if (typeof cell.value === 'number') {
                    cell.numFmt = '$#,##0.00';
                }
            });
        }

        // Generate filename using timestamp and store name
        const timestamp = Date.now();
        const storeName = receiptData.storeName ? receiptData.storeName.replace(/[^a-zA-Z0-9]/g, '_') : 'receipt';
        const filename = `receipt_${storeName}_${timestamp}.xlsx`;
        
        const filePath = path.join(this.exportsPath, filename);
        await workbook.xlsx.writeFile(filePath);
        return filePath;
    }
}

module.exports = new ExcelGenerator(); 