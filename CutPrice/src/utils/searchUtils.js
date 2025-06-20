import { COLORS } from '../constants/theme';
import { productService } from '../services/api';

// Define food-related categories
const FOOD_CATEGORIES = [
  'Dairy',
  'Produce',
  'Meat',
  'Bakery',
  'Grains',
  'Beverages',
  'Snacks',
  'Breakfast',
  'Baking'
];

// Keywords for food-related searches
const FOOD_KEYWORDS = [
  'food',
  'eat',
  'meal',
  'snack',
  'drink',
  'fruit',
  'vegetable',
  'meat',
  'dairy',
  'bread',
  'grain'
];

// Helper function to remove duplicates and get unique items
const getUniqueItems = (items) => {
  const uniqueMap = new Map();
  
  items.forEach(item => {
    if (!uniqueMap.has(item.name)) {
      uniqueMap.set(item.name, {
        ...item,
        allPrices: [{ store: item.store, price: item.price }]
      });
    } else {
      const existingItem = uniqueMap.get(item.name);
      existingItem.allPrices.push({ store: item.store, price: item.price });
      
      // Update the main price to be the lowest one
      if (item.price < existingItem.price) {
        existingItem.price = item.price;
        existingItem.store = item.store;
      }
    }
  });
  
  return Array.from(uniqueMap.values());
};

export const searchItems = async (searchQuery) => {
  try {
    const query = searchQuery.toLowerCase();
    
    // Check if the search is food-related
    const isFoodSearch = FOOD_KEYWORDS.some(keyword => query.includes(keyword));
    
    // Get search results from the API
    const results = await productService.searchProducts(query, '', isFoodSearch);

    if (results.length > 0) {
      // Remove duplicates and group by name
      const uniqueResults = getUniqueItems(results);
      
      // Sort by price
      uniqueResults.sort((a, b) => a.price - b.price);
      
      // Mark best and worst prices
      const lowestPrice = uniqueResults[0].price;
      const highestPrice = uniqueResults[uniqueResults.length - 1].price;
      
      uniqueResults.forEach(item => {
        if (item.price === lowestPrice) {
          item.priceType = 'lowest';
        } else if (item.price === highestPrice) {
          item.priceType = 'highest';
        } else {
          item.priceType = 'normal';
        }
        
        // Sort the allPrices array by price
        item.allPrices.sort((a, b) => a.price - b.price);
      });
      
      return uniqueResults;
    }

    return results;
  } catch (error) {
    console.error('Error searching items:', error);
    return [];
  }
}; 