import * as FileSystem from 'expo-file-system';

export const loadStoreInventory = async (storeName) => {
  try {
    // Mock data for now - in a real app, this would load from CSV files
    const mockData = [
      { Item: 'Organic Bananas', Price: '2.99', Rating: '4.5', Organic: 'Yes' },
      { Item: 'Whole Milk', Price: '3.49', Rating: '4.8', Organic: 'No' },
      { Item: 'Wheat Bread', Price: '2.49', Rating: '4.2', Organic: 'No' },
      { Item: 'Chicken Breast', Price: '5.99', Rating: '4.6', Organic: 'No' },
      { Item: 'Toilet Paper', Price: '12.99', Rating: '4.3', Organic: 'No' },
      { Item: 'Tomato Sauce', Price: '1.99', Rating: '4.4', Organic: 'No' },
      { Item: 'Organic Apples', Price: '4.99', Rating: '4.7', Organic: 'Yes' },
      { Item: 'Pasta', Price: '1.49', Rating: '4.5', Organic: 'No' },
      { Item: 'Detergent', Price: '9.99', Rating: '4.6', Organic: 'No' },
    ];

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return mockData;
  } catch (error) {
    console.error('Error loading store inventory:', error);
    throw error;
  }
};

const parseCSVData = (csvContent) => {
  const lines = csvContent.trim().split('\\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    return headers.reduce((obj, header, index) => {
      obj[header] = values[index];
      return obj;
    }, {});
  });
}; 