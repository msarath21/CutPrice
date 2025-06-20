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
  Modal,
  Alert,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS, FONTS } from '../constants/theme';
import { withBrownStatusBar } from '../utils/screenUtils';
import { productService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCart } from '../context/CartContext';

// Import the header image
const headerLogo = require('../../assets/header.png');

const STATUSBAR_HEIGHT = RNStatusBar.currentHeight || 0;

function PriceComparisonModal({ visible, onClose, productName, prices }) {
  const { addToCart } = useCart();

  const handleAddToCart = async (store, price) => {
    try {
      await addToCart(store, {
        name: productName,
        price: price
      });
      
      Alert.alert(
        'Added to Cart',
        `${productName} has been added to your ${store} cart.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{productName}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.priceList}>
            {prices.map((item, index) => (
              <View key={index} style={styles.priceItem}>
                <View style={styles.storeContainer}>
                  <Ionicons 
                    name="storefront-outline" 
                    size={16} 
                    color={COLORS.gray} 
                    style={styles.storeIcon}
                  />
                  <Text style={styles.storeName}>{item.store}</Text>
                </View>
                <View style={styles.priceActions}>
                  <Text style={[
                    styles.priceText,
                    index === 0 && styles.lowestPrice,
                    index === prices.length - 1 && styles.highestPrice
                  ]}>
                    ${Number(item.price).toFixed(2)}
                  </Text>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => handleAddToCart(item.store, item.price)}
                  >
                    <Ionicons name="add-circle" size={24} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function ProductsScreen({ route, navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { storeName, category, categoryId, productName, allPrices } = route.params || {};

  useEffect(() => {
    if (productName && allPrices) {
      // Coming from search - show price comparison directly
      const sortedPrices = [...allPrices].sort((a, b) => a.price - b.price);
      setSelectedProduct({
        name: productName,
        prices: sortedPrices
      });
      setModalVisible(true);
      setLoading(false);
    } else {
      loadProducts();
    }
  }, [storeName, category, productName, allPrices]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      let data;
      if (category) {
        // Get products by category
        data = await productService.getProductsByCategory(category);
      } else if (storeName) {
        // Get products by store
        data = await productService.getProductsByStore(storeName);
      } else {
        // Get all products
        data = await productService.getAllProducts();
      }

      // Group products by name and find min/max prices
      const groupedProducts = data.reduce((acc, product) => {
        if (!acc[product.name]) {
          acc[product.name] = {
            name: product.name,
            unit: product.unit,
            category: product.category,
            prices: [],
            lowestPrice: Infinity,
            highestPrice: -Infinity
          };
        }
        acc[product.name].prices.push({
          store: product.store,
          price: product.price,
          is_organic: product.is_organic
        });
        
        if (product.price < acc[product.name].lowestPrice) {
          acc[product.name].lowestPrice = product.price;
        }
        if (product.price > acc[product.name].highestPrice) {
          acc[product.name].highestPrice = product.price;
        }
        
        return acc;
      }, {});

      setProducts(Object.values(groupedProducts));
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductPress = (product) => {
    const sortedPrices = product.prices
      .sort((a, b) => a.price - b.price);

    setSelectedProduct({
      name: product.name,
      prices: sortedPrices
    });
    setModalVisible(true);
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleProductPress(item)}
    >
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productUnit}>{item.unit}</Text>
        <Text style={styles.priceRange}>
          ${Number(item.lowestPrice).toFixed(2)} - ${Number(item.highestPrice).toFixed(2)}
        </Text>
        <Text style={styles.storeCount}>{item.prices.length} stores available</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
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
        {!productName && (
          <Text style={styles.title}>
            {category ? `${category}` : storeName ? `${storeName} Products` : 'All Products'}
          </Text>
        )}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : !productName ? (
          <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={(item) => item.name}
            contentContainerStyle={styles.productsList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No products found</Text>
              </View>
            )}
          />
        ) : null}
      </View>

      <PriceComparisonModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          if (productName) {
            navigation.goBack();
          }
        }}
        productName={selectedProduct?.name}
        prices={selectedProduct?.prices || []}
      />
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
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerSafeArea: {
    paddingTop: Platform.OS === 'android' ? STATUSBAR_HEIGHT : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding / 2,
  },
  logo: {
    width: 100,
    height: 40,
  },
  headerRight: {
    width: 24,
  },
  content: {
    flex: 1,
    padding: SIZES.padding,
  },
  title: {
    fontSize: SIZES.h2,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SIZES.padding,
  },
  productsList: {
    paddingBottom: SIZES.padding * 2,
  },
  productCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
    ...SHADOWS.medium,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 4,
  },
  productUnit: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 8,
  },
  priceRange: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  storeCount: {
    fontSize: 12,
    color: COLORS.gray,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SIZES.radius * 2,
    borderTopRightRadius: SIZES.radius * 2,
    padding: SIZES.padding,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.padding,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
  },
  priceList: {
    paddingBottom: SIZES.padding,
  },
  priceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  storeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  storeIcon: {
    marginRight: 8,
  },
  storeName: {
    fontSize: 14,
    color: COLORS.black,
    flex: 1,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
  },
  lowestPrice: {
    color: COLORS.success || '#28a745',
  },
  highestPrice: {
    color: COLORS.error || '#dc3545',
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
    paddingVertical: SIZES.padding * 2,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
  },
  priceActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    marginLeft: SIZES.base,
    padding: 4,
  },
});

export default withBrownStatusBar(ProductsScreen); 