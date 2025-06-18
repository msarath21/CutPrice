import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Platform,
  StatusBar as RNStatusBar,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import StatusBar from '../components/StatusBar';

const STATUSBAR_HEIGHT = RNStatusBar.currentHeight || 0;

// Categories for store items
const categories = [
  'Fruits & Vegetables',
  'Dairy & Eggs',
  'Bread & Bakery',
  'Meat & Poultry',
  'Household',
  'Pantry',
];

const categorizeItems = (items) => {
  return {
    'Fruits & Vegetables': items.filter(item => 
      item.name.toLowerCase().includes('apple') || 
      item.name.toLowerCase().includes('banana')
    ),
    'Dairy & Eggs': items.filter(item => 
      item.name.toLowerCase().includes('milk')
    ),
    'Bread & Bakery': items.filter(item => 
      item.name.toLowerCase().includes('bread')
    ),
    'Meat & Poultry': items.filter(item => 
      item.name.toLowerCase().includes('chicken') || 
      item.name.toLowerCase().includes('beef')
    ),
    'Household': items.filter(item => 
      item.name.toLowerCase().includes('toilet') || 
      item.name.toLowerCase().includes('detergent')
    ),
    'Pantry': items.filter(item => 
      item.name.toLowerCase().includes('tomato') || 
      item.name.toLowerCase().includes('pasta')
    ),
  };
};

function StoreDetailsScreen({ route, navigation }) {
  const { store } = route.params;
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categorizedItems, setCategorizedItems] = useState({});

  useEffect(() => {
    fetchStoreProducts();
  }, [store]);

  const fetchStoreProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`http://10.0.0.169:3000/api/products/store/${encodeURIComponent(store.name)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch store products');
      }

      const data = await response.json();
      setProducts(data);
      setCategorizedItems(categorizeItems(data));
    } catch (err) {
      console.error('Error fetching store products:', err);
      setError('Failed to load store products');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{store.name}</Text>
        </View>

        <View style={styles.addressContainer}>
          <MaterialIcons name="location-on" size={20} color={COLORS.gray} />
          <Text style={styles.addressText}>{store.address}</Text>
        </View>

        <View style={styles.categoriesContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  selectedCategory === item && styles.selectedCategory,
                ]}
                onPress={() => setSelectedCategory(item)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === item && styles.selectedCategoryText,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <FlatList
            style={styles.productList}
            data={categorizedItems[selectedCategory] || []}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <View style={styles.productCard}>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productUnit}>{item.unit}</Text>
                </View>
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>${item.price.toFixed(2)}</Text>
                  <View style={styles.ratingContainer}>
                    <MaterialIcons name="star" size={16} color={COLORS.primary} />
                    <Text style={styles.rating}>{item.rating.toFixed(1)}</Text>
                  </View>
                </View>
              </View>
            )}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? STATUSBAR_HEIGHT : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backButton: {
    padding: SIZES.base,
  },
  headerTitle: {
    fontSize: SIZES.fontSize.title,
    fontWeight: '600',
    color: COLORS.black,
    marginLeft: SIZES.padding,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding / 2,
    backgroundColor: COLORS.lightGray2,
  },
  addressText: {
    marginLeft: SIZES.base,
    color: COLORS.gray,
    fontSize: SIZES.fontSize.body,
  },
  categoriesContainer: {
    paddingVertical: SIZES.padding,
  },
  categoryButton: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding / 2,
    marginHorizontal: SIZES.base,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.lightGray2,
  },
  selectedCategory: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    color: COLORS.gray,
    fontSize: SIZES.fontSize.body,
  },
  selectedCategoryText: {
    color: COLORS.white,
    fontWeight: '500',
  },
  productList: {
    flex: 1,
    padding: SIZES.padding,
  },
  productCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.gray,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: SIZES.fontSize.subtitle,
    fontWeight: '500',
    color: COLORS.black,
    marginBottom: 4,
  },
  productUnit: {
    fontSize: SIZES.fontSize.small,
    color: COLORS.gray,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: SIZES.fontSize.subtitle,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 4,
    fontSize: SIZES.fontSize.small,
    color: COLORS.gray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  errorText: {
    color: COLORS.error,
    textAlign: 'center',
    fontSize: SIZES.fontSize.body,
  },
});

export default StoreDetailsScreen; 