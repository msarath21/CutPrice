import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  Platform,
  StatusBar as RNStatusBar,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import StatusBar from '../components/StatusBar';
import { searchItems } from '../utils/searchUtils';

// Import the header image
const headerLogo = require('../../assets/header.png');

const STATUSBAR_HEIGHT = RNStatusBar.currentHeight || 0;

export default function ProductsScreen({ route, navigation }) {
  const { category } = route.params;
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, [category]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const results = await searchItems(category);
      setProducts(results);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (text) => {
    setSearchQuery(text);
    if (text.length >= 2) {
      setLoading(true);
      const results = await searchItems(text);
      setProducts(results);
      setLoading(false);
    } else if (text.length === 0) {
      loadProducts();
    }
  };

  const renderProduct = ({ item }) => (
    <View style={styles.productCard}>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.Item}</Text>
        <Text style={styles.storeName}>{item.store}</Text>
        <View style={styles.priceContainer}>
          <Text 
            style={[
              styles.price,
              item.priceType === 'lowest' && styles.lowestPrice,
              item.priceType === 'highest' && styles.highestPrice,
            ]}
          >
            ${item.Price}
          </Text>
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
              <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <Image 
              source={headerLogo}
              style={styles.logo}
              resizeMode="contain"
            />
            <View style={styles.headerRight} />
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{category}</Text>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={24} color={COLORS.gray} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor={COLORS.gray}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => {
                setSearchQuery('');
                loadProducts();
              }}
            >
              <Ionicons name="close-circle" size={20} color={COLORS.gray} />
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={(item, index) => `${item.Item}-${item.store}-${index}`}
            contentContainerStyle={styles.productsList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No products found</Text>
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
    backgroundColor: COLORS.white,
    height: 56,
  },
  logo: {
    height: 40,
    width: 120,
  },
  headerRight: {
    width: 24, // To balance the back button
  },
  content: {
    flex: 1,
    padding: SIZES.padding,
  },
  title: {
    fontSize: SIZES.fontSize.title,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: SIZES.padding,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    marginBottom: SIZES.padding,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black,
  },
  clearButton: {
    padding: 4,
  },
  productsList: {
    gap: SIZES.padding,
  },
  productCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  productInfo: {
    gap: 4,
  },
  productName: {
    fontSize: SIZES.fontSize.subtitle,
    fontWeight: '500',
    color: COLORS.black,
  },
  storeName: {
    fontSize: SIZES.fontSize.body,
    color: COLORS.gray,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  price: {
    fontSize: SIZES.fontSize.subtitle,
    fontWeight: '600',
    color: COLORS.black,
  },
  lowestPrice: {
    color: '#2E7D32', // Dark green
  },
  highestPrice: {
    color: '#C62828', // Dark red
  },
  organicBadge: {
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  organicText: {
    fontSize: 12,
    color: '#1E8E3E',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 32,
  },
  emptyStateText: {
    fontSize: SIZES.fontSize.body,
    color: COLORS.gray,
    textAlign: 'center',
  },
}); 