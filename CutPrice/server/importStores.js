const mongoose = require('mongoose');
const Store = require('./models/Store');

const initialStores = [
  {
    name: 'Walmart Supercenter',
    address: '123 Main St, City, State',
    location: {
      type: 'Point',
      coordinates: [-122.084, 37.422] // Example coordinates
    }
  },
  {
    name: 'Costco Wholesale',
    address: '456 Market St, City, State',
    location: {
      type: 'Point',
      coordinates: [-122.086, 37.424] // Example coordinates
    }
  },
  {
    name: 'India Cash & Carry',
    address: '789 Commerce St, City, State',
    location: {
      type: 'Point',
      coordinates: [-122.088, 37.426] // Example coordinates
    }
  }
];

async function importStores() {
  try {
    await mongoose.connect('mongodb://localhost:27017/cutprice', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Clear existing stores
    await Store.deleteMany({});
    console.log('Cleared existing stores');

    // Import new stores
    const stores = await Store.insertMany(initialStores);
    console.log(`Imported ${stores.length} stores successfully`);

    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error importing stores:', error);
    process.exit(1);
  }
}

importStores(); 