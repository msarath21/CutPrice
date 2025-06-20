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
import { COLORS, SIZES, SHADOWS, FONTS } from '../constants/theme';
import StatusBar from '../components/StatusBar';
import { productService } from '../services/api';

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
      item.category === 'Fruits & Vegetables'
    ),
    'Dairy & Eggs': items.filter(item => 
      item.category === 'Dairy & Eggs'
    ),
    'Bread & Bakery': items.filter(item => 
      item.category === 'Bread & Bakery'
    ),
    'Meat & Poultry': items.filter(item => 
      item.category === 'Meat & Poultry'
    ),
    'Household': items.filter(item => 
      item.category === 'Household'
    ),
    'Pantry': items.filter(item => 
      item.category === 'Pantry'
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

      const data = await productService.getProductsByStore(store.name);
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
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => navigation.goBack()}
            >
              <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{store.name}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.storeInfo}>
            <Text style={styles.storeName}>{store.name}</Text>
            <Text style={styles.storeAddress}>{store.address}</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{products.length}</Text>
              <Text style={styles.statLabel}>Products</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{categories.length}</Text>
              <Text style={styles.statLabel}>Categories</Text>
            </View>
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
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.productCard}>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text style={styles.productUnit}>{item.unit}</Text>
                  </View>
                  <View style={styles.priceContainer}>
                    <Text style={styles.price}>${Number(item.price).toFixed(2)}</Text>
                    <View style={styles.ratingContainer}>
                      <MaterialIcons name="star" size={16} color={COLORS.primary} />
                      <Text style={styles.rating}>{Number(item.rating || 0).toFixed(1)}</Text>
                    </View>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  statusBarBackground: {
    height: Platform.OS === 'android' ? RNStatusBar.currentHeight || 0 : 0,
    backgroundColor: COLORS.primary,
  },
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: COLORS.white,
    ...SHADOWS.light,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding * 1.5,
    paddingBottom: SIZES.padding,
    backgroundColor: COLORS.white,
  },
  headerButton: {
    padding: SIZES.base,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    ...SHADOWS.light,
  },
  headerTitle: {
    fontSize: SIZES.large,
    fontFamily: FONTS.medium,
    color: COLORS.black,
  },
  content: {
    flex: 1,
    padding: SIZES.padding,
  },
  storeInfo: {
    marginBottom: SIZES.padding * 2,
  },
  storeName: {
    fontSize: SIZES.fontSize.title,
    fontFamily: FONTS.medium,
    color: COLORS.black,
    marginBottom: SIZES.base,
  },
  storeAddress: {
    fontSize: SIZES.fontSize.subtitle,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    marginBottom: SIZES.padding,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.padding * 2,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginHorizontal: SIZES.base,
    ...SHADOWS.light,
  },
  statValue: {
    fontSize: SIZES.fontSize.title,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    marginBottom: SIZES.base,
  },
  statLabel: {
    fontSize: SIZES.fontSize.subtitle,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
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
    marginRight: SIZES.padding,
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