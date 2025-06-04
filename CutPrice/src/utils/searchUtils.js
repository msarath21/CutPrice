import * as FileSystem from 'expo-file-system';
import * as Asset from 'expo-asset';

const parseCSVData = (csvContent) => {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    return headers.reduce((obj, header, index) => {
      obj[header] = values[index];
      return obj;
    }, {});
  });
};

export const searchItems = async (searchQuery) => {
  try {
    const stores = [
      { name: 'Walmart Supercenter', file: 'Walmart_Inventory.csv' },
      { name: 'Costco Wholesale', file: 'Costco_Inventory.csv' },
      { name: 'India Cash & Carry', file: 'Indian_Store_Inventory.csv' },
    ];

    const results = [];
    const storesDir = `${FileSystem.documentDirectory}stores`;

    for (const store of stores) {
      try {
        const filePath = `${storesDir}/${store.file}`;
        const fileInfo = await FileSystem.getInfoAsync(filePath);
        
        if (!fileInfo.exists) {
          console.warn(`Store file not found: ${store.file}`);
          continue;
        }

        const fileContent = await FileSystem.readAsStringAsync(filePath);
        const items = parseCSVData(fileContent);
        
        const matchingItems = items.filter(item => 
          item.Item.toLowerCase().includes(searchQuery.toLowerCase())
        );

        matchingItems.forEach(item => {
          results.push({
            ...item,
            store: store.name,
            priceNum: parseFloat(item.Price)
          });
        });
      } catch (storeError) {
        console.error(`Error processing store ${store.name}:`, storeError);
      }
    }

    if (results.length > 0) {
      // Sort by price
      results.sort((a, b) => a.priceNum - b.priceNum);
      
      // Mark best and worst prices
      const lowestPrice = results[0].priceNum;
      const highestPrice = results[results.length - 1].priceNum;
      
      results.forEach(item => {
        if (item.priceNum === lowestPrice) {
          item.priceType = 'lowest';
        } else if (item.priceNum === highestPrice) {
          item.priceType = 'highest';
        } else {
          item.priceType = 'normal';
        }
      });
    }

    return results;
  } catch (error) {
    console.error('Error searching items:', error);
    return [];
  }
}; 