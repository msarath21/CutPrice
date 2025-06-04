import * as FileSystem from 'expo-file-system';

export const setupStoreFiles = async () => {
  try {
    const storesDir = `${FileSystem.documentDirectory}stores`;
    const storesDirInfo = await FileSystem.getInfoAsync(storesDir);

    if (!storesDirInfo.exists) {
      await FileSystem.makeDirectoryAsync(storesDir, { intermediates: true });
    }

    const stores = [
      { name: 'Walmart_Inventory.csv', content: 'Item,Price,Rating,Organic\nOrganic Bananas,2.99,4.5,Yes\nWhole Milk,3.49,4.8,No\nWheat Bread,2.49,4.2,No' },
      { name: 'Costco_Inventory.csv', content: 'Item,Price,Rating,Organic\nOrganic Apples,4.99,4.7,Yes\nChicken Breast,5.99,4.6,No\nToilet Paper,12.99,4.3,No' },
      { name: 'Indian_Store_Inventory.csv', content: 'Item,Price,Rating,Organic\nTomato Sauce,1.99,4.4,No\nPasta,1.49,4.5,No\nDetergent,9.99,4.6,No' },
    ];

    for (const store of stores) {
      const filePath = `${storesDir}/${store.name}`;
      const fileInfo = await FileSystem.getInfoAsync(filePath);

      if (!fileInfo.exists) {
        await FileSystem.writeAsStringAsync(filePath, store.content);
      }
    }

    console.log('Store files setup completed');
  } catch (error) {
    console.error('Error setting up store files:', error);
  }
}; 