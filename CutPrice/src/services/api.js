import supabase from '../config/supabase';

// Replace localhost with your computer's IP address
const API_URL = 'http://10.0.0.169:3000/api';

const logDataSource = (source, count) => {
  console.log(`Fetched ${count} items from ${source}`);
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

export const fetchProducts = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*');

    if (error) throw error;
    logDataSource('Supabase', data.length);
    return data;
  } catch (error) {
    console.error('Error fetching products:', error.message);
    throw error;
  }
};

export const fetchProductsByStore = async (storeName) => {
  try {
    console.log(`Attempting to fetch products for ${storeName} from Supabase...`);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('store_name', storeName);

    if (error) throw error;
    logDataSource(`Supabase (${storeName})`, data.length);
    return data;
  } catch (error) {
    console.error('Error fetching products by store:', error.message);
    throw error;
  }
};

export const createProduct = async (productData) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error creating product:', error.message);
    throw error;
  }
};

export const updateProduct = async (id, productData) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error updating product:', error.message);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting product:', error.message);
    throw error;
  }
};

export const productService = {
  // Get all products
  getAllProducts: async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Get products by category
  getProductsByCategory: async (category) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .order('name');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
  },

  // Get products by store
  getProductsByStore: async (storeName) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('store', storeName)
        .order('name');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching products by store:', error);
      throw error;
    }
  },

  // Search products
  searchProducts: async (query, store = '') => {
    try {
      let queryBuilder = supabase
        .from('products')
        .select('*');

      if (query) {
        queryBuilder = queryBuilder.ilike('name', `%${query}%`);
      }

      if (store) {
        queryBuilder = queryBuilder.eq('store', store);
      }

      const { data, error } = await queryBuilder.order('name');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  },

  // Get organic products
  getOrganicProducts: async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_organic', true)
        .order('name');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching organic products:', error);
      throw error;
    }
  },

  // Compare product prices
  compareProductPrices: async (productName) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .ilike('name', `%${productName}%`)
        .order('price');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error comparing product prices:', error);
      throw error;
    }
  },

  // Create a new product
  createProduct: async (productData) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Update a product
  updateProduct: async (id, productData) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  // Delete a product
  deleteProduct: async (id) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }
}; 