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
import { loadStoreInventory } from '../utils/csvLoader';

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
      item.Item.toLowerCase().includes('apple') || 
      item.Item.toLowerCase().includes('banana')
    ),
    'Dairy & Eggs': items.filter(item => 
      item.Item.toLowerCase().includes('milk')
    ),
    'Bread & Bakery': items.filter(item => 
      item.Item.toLowerCase().includes('bread')
    ),
    'Meat & Poultry': items.filter(item => 
      item.Item.toLowerCase().includes('chicken') || 
      item.Item.toLowerCase().includes('beef')
    ),
    'Household': items.filter(item => 
      item.Item.toLowerCase().includes('toilet') || 
      item.Item.toLowerCase().includes('detergent')
    ),
    'Pantry': items.filter(item => 
      item.Item.toLowerCase().includes('tomato') || 
      item.Item.toLowerCase().includes('pasta')
    ),
  };
};

const parseCSVData = (csvContent) => {
  const lines = csvContent.split('\\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    return headers.reduce((obj, header, index) => {
      obj[header] = values[index];
      return obj;
    }, {});
  });
};

export default function StoreDetailsScreen({ route, navigation }) {
  const { store } = route.params;
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [storeItems, setStoreItems] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const items = await loadStoreInventory(store.name);
        setStoreItems(categorizeItems(items));
      } catch (error) {
        console.error('Error loading store items:', error);
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [store]);

  const renderItem = ({ item }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.Item}</Text>
        <View style={styles.itemDetails}>
          <Text style={styles.itemPrice}>${item.Price}</Text>
          <View style={styles.ratingContainer}>
            <MaterialIcons name="star" size={16} color={COLORS.primary} />
            <Text style={styles.rating}>{item.Rating}</Text>
          </View>
          {item.Organic === 'Yes' && (
            <View style={styles.organicBadge}>
              <Text style={styles.organicText}>Organic</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar />
      <View style={styles.headerContainer}>
        <SafeAreaView style={styles.headerSafeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{store.name}</Text>
            <View style={{ width: 24 }} />
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.content}>
        <View style={styles.categoriesContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.categoryTab,
                  activeCategory === item && styles.activeCategoryTab,
                ]}
                onPress={() => setActiveCategory(item)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    activeCategory === item && styles.activeCategoryText,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={storeItems[activeCategory] || []}
            renderItem={renderItem}
            keyExtractor={(item) => item.Item}
            contentContainerStyle={styles.itemsList}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No items found in this category</Text>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  headerContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    paddingTop: Platform.OS === 'android' ? STATUSBAR_HEIGHT : 0,
    zIndex: 2,
    elevation: Platform.OS === 'android' ? 4 : 0,
    shadowColor: Platform.OS === 'ios' ? '#000' : undefined,
    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 2 } : undefined,
    shadowOpacity: Platform.OS === 'ios' ? 0.2 : undefined,
    shadowRadius: Platform.OS === 'ios' ? 2 : undefined,
  },
  headerSafeArea: {
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding,
    height: 56,
  },
  headerTitle: {
    fontSize: SIZES.fontSize.subtitle,
    fontWeight: '600',
    color: COLORS.primary,
  },
  content: {
    flex: 1,
  },
  categoriesContainer: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  categoriesList: {
    padding: SIZES.padding,
  },
  categoryTab: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.lightGray,
    marginRight: SIZES.base,
  },
  activeCategoryTab: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    fontSize: SIZES.fontSize.body,
    color: COLORS.gray,
  },
  activeCategoryText: {
    color: COLORS.white,
    fontWeight: '500',
  },
  itemsList: {
    padding: SIZES.padding,
  },
  itemCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    padding: SIZES.padding,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: SIZES.fontSize.body,
    fontWeight: '500',
    color: COLORS.black,
    marginBottom: SIZES.base,
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.padding,
  },
  itemPrice: {
    fontSize: SIZES.fontSize.body,
    fontWeight: '600',
    color: COLORS.primary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: SIZES.fontSize.small,
    color: COLORS.gray,
  },
  organicBadge: {
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: SIZES.radius,
  },
  organicText: {
    fontSize: SIZES.fontSize.small,
    color: '#1E8E3E',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: SIZES.padding * 2,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: SIZES.fontSize.body,
    color: COLORS.gray,
    textAlign: 'center',
  },
}); 