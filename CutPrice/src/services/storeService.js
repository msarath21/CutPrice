import supabase from '../config/supabase';

const defaultStores = [
  {
    name: 'Walmart',
    address: '123 Main St, San Jose, CA 95112',
    latitude: 37.3382,
    longitude: -121.8863,
    isActive: true
  },
  {
    name: 'Target',
    address: '456 Market St, San Jose, CA 95113',
    latitude: 37.3372,
    longitude: -121.8853,
    isActive: true
  },
  {
    name: 'Costco',
    address: '789 Coleman Ave, San Jose, CA 95110',
    latitude: 37.3482,
    longitude: -121.9163,
    isActive: true
  },
  {
    name: 'Whole Foods',
    address: '777 The Alameda, San Jose, CA 95126',
    latitude: 37.3332,
    longitude: -121.9063,
    isActive: true
  }
];

export const getStores = async () => {
  try {
    const { data, error } = await supabase
      .from('stores')
      .select('*');

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching stores:', error.message);
    throw error;
  }
};

export const getStoreById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching store:', error.message);
    throw error;
  }
};

export const createStore = async (storeData) => {
  try {
    const { data, error } = await supabase
      .from('stores')
      .insert([storeData])
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error creating store:', error.message);
    throw error;
  }
};

export const updateStore = async (id, storeData) => {
  try {
    const { data, error } = await supabase
      .from('stores')
      .update(storeData)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error updating store:', error.message);
    throw error;
  }
};

export const deleteStore = async (id) => {
  try {
    const { error } = await supabase
      .from('stores')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting store:', error.message);
    throw error;
  }
};

export const storeService = {
  // Get all stores
  getAllStores: async () => {
    try {
      // First check if we have any stores
      const { data: existingStores, error: checkError } = await supabase
        .from('stores')
        .select('*');

      if (checkError) throw checkError;

      // If no stores exist, insert the default ones
      if (!existingStores || existingStores.length === 0) {
        const { data: insertedStores, error: insertError } = await supabase
          .from('stores')
          .insert(defaultStores)
          .select();

        if (insertError) throw insertError;
        return insertedStores;
      }

      // Get all stores ordered by name
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching stores:', error);
      throw error;
    }
  },

  // Get store by name
  getStoreByName: async (name) => {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('name', name)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching store:', error);
      throw error;
    }
  },

  // Get nearby stores
  getNearbyStores: async (latitude, longitude, distance) => {
    try {
      const { data, error } = await supabase.rpc('find_stores_within_distance', {
        p_latitude: latitude,
        p_longitude: longitude,
        p_distance: distance
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching nearby stores:', error);
      throw error;
    }
  }
}; 