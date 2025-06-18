import { mockProducts } from './mockData';

// Replace localhost with your computer's IP address
const API_URL = 'http://10.0.0.169:3000/api';

const logDataSource = (source, count) => {
  console.log(`[Data Source] Fetched ${count} items from ${source}`);
};

// Helper function to transform mock data to match MongoDB format
const transformMockData = (storeName) => {
  const allProducts = Object.values(mockProducts).flat();
  const transformed = allProducts.map(product => ({
    _id: product.id,
    name: product.name,
    price: product.prices[storeName],
    rating: product.ratings[storeName],
    isOrganic: product.organic[storeName],
    store: storeName,
    unit: product.unit,
    lastUpdated: new Date()
  }));
  logDataSource('Mock Data', transformed.length);
  return transformed;
};

export const productService = {
  // Get all products
  getAllProducts: async () => {
    try {
      const response = await fetch(`${API_URL}/products`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      logDataSource('MongoDB', data.length);
      return data;
    } catch (error) {
      console.warn('Falling back to mock data:', error);
      // Combine products from all stores
      const mockData = [
        ...transformMockData('Walmart'),
        ...transformMockData('Costco'),
        ...transformMockData('Indian Store')
      ];
      return mockData;
    }
  },

  // Get products by store
  getProductsByStore: async (storeName) => {
    try {
      console.log(`Attempting to fetch products for ${storeName} from MongoDB...`);
      const response = await fetch(`${API_URL}/products/store/${storeName}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      logDataSource(`MongoDB (${storeName})`, data.length);
      return data;
    } catch (error) {
      console.warn(`Falling back to mock data for ${storeName}:`, error);
      return transformMockData(storeName);
    }
  },

  // Search products
  searchProducts: async (query, store = '') => {
    try {
      const params = new URLSearchParams();
      if (query) params.append('query', query);
      if (store) params.append('store', store);
      
      const response = await fetch(`${API_URL}/products/search?${params}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      return data;
    } catch (error) {
      console.warn('Falling back to mock data:', error);
      let mockData = store ? 
        transformMockData(store) :
        [
          ...transformMockData('Walmart'),
          ...transformMockData('Costco'),
          ...transformMockData('Indian Store')
        ];
      
      if (query) {
        const searchTerm = query.toLowerCase();
        mockData = mockData.filter(product => 
          product.name.toLowerCase().includes(searchTerm)
        );
      }
      return mockData;
    }
  },

  // Get organic products
  getOrganicProducts: async () => {
    try {
      const response = await fetch(`${API_URL}/products/organic`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      return data;
    } catch (error) {
      console.warn('Falling back to mock data:', error);
      return [
        ...transformMockData('Walmart'),
        ...transformMockData('Costco'),
        ...transformMockData('Indian Store')
      ].filter(product => product.isOrganic);
    }
  },

  // Compare product prices
  compareProductPrices: async (productName) => {
    try {
      const response = await fetch(`${API_URL}/products/compare/${productName}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      return data;
    } catch (error) {
      console.warn('Falling back to mock data:', error);
      const allProducts = [
        ...transformMockData('Walmart'),
        ...transformMockData('Costco'),
        ...transformMockData('Indian Store')
      ];
      return allProducts.filter(product => 
        product.name.toLowerCase() === productName.toLowerCase()
      );
    }
  }
}; 