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
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS, FONTS } from '../constants/theme';
import { withBrownStatusBar } from '../utils/screenUtils';
import { productService } from '../services/api';

// Import the header image
const headerLogo = require('../../assets/header.png');

const STATUSBAR_HEIGHT = RNStatusBar.currentHeight || 0;

function PriceComparisonModal({ visible, onClose, productName, prices }) {
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
                <Text style={styles.storeName}>{item.store}</Text>
                <Text style={[
                  styles.priceText,
                  item.isLowest && styles.lowestPrice,
                  item.isHighest && styles.highestPrice
                ]}>
                  ${Number(item.price).toFixed(2)}
                </Text>
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
  const { storeName, category, categoryId } = route.params || {};

  useEffect(() => {
    loadProducts();
  }, [storeName, category]);

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
    const sortedPrices = product.prices.map(price => ({
      ...price,
      isLowest: price.price === product.lowestPrice,
      isHighest: price.price === product.highestPrice
    })).sort((a, b) => a.price - b.price);

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
        <Text style={styles.title}>
          {category ? `${category}` : storeName ? `${storeName} Products` : 'All Products'}
        </Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
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
        )}
      </View>

      <PriceComparisonModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
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
  headerSafeArea: {
    backgroundColor: COLORS.white,
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
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productsList: {
    padding: SIZES.padding,
  },
  productCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
    ...SHADOWS.medium,
  },
  productInfo: {
    gap: SIZES.base,
  },
  productName: {
    fontSize: SIZES.fontSize.subtitle,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  productUnit: {
    fontSize: SIZES.fontSize.body,
    color: COLORS.gray,
  },
  priceRange: {
    fontSize: SIZES.fontSize.subtitle,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  storeCount: {
    fontSize: SIZES.fontSize.body,
    color: COLORS.gray,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding * 2,
  },
  emptyStateText: {
    fontSize: SIZES.fontSize.body,
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
    minHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.padding,
  },
  modalTitle: {
    fontSize: SIZES.fontSize.title,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  priceList: {
    gap: SIZES.padding,
  },
  priceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.padding / 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  storeName: {
    fontSize: SIZES.fontSize.subtitle,
    color: COLORS.black,
  },
  priceText: {
    fontSize: SIZES.fontSize.subtitle,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  lowestPrice: {
    color: COLORS.success,
  },
  highestPrice: {
    color: COLORS.error,
  },
});

export default withBrownStatusBar(ProductsScreen); 