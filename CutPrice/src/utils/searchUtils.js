import { COLORS } from '../constants/theme';
import { productService } from '../services/api';

export const searchItems = async (searchQuery) => {
  try {
    const results = await productService.searchProducts(searchQuery);

    if (results.length > 0) {
      // Sort by price
      results.sort((a, b) => a.price - b.price);
      
      // Mark best and worst prices
      const lowestPrice = results[0].price;
      const highestPrice = results[results.length - 1].price;
      
      results.forEach(item => {
        if (item.price === lowestPrice) {
          item.priceType = 'lowest';
        } else if (item.price === highestPrice) {
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