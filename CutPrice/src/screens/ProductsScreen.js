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
import { COLORS, SIZES, SHADOWS, FONTS } from '../constants/theme';
import { withBrownStatusBar } from '../utils/screenUtils';
import { productService } from '../services/api';

// Import the header image
const headerLogo = require('../../assets/header.png');

const STATUSBAR_HEIGHT = RNStatusBar.currentHeight || 0;

function ProductsScreen({ route, navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { storeName } = route.params || {};

  useEffect(() => {
    loadProducts();
  }, [storeName]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      let data;
      if (storeName) {
        data = await productService.getProductsByStore(storeName);
      } else {
        data = await productService.getAllProducts();
      }
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetails', { product: item })}
    >
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productUnit}>{item.unit}</Text>
        <Text style={styles.productPrice}>${Number(item.price).toFixed(2)}</Text>
        <Text style={styles.productRating}>Rating: {Number(item.rating || 0).toFixed(1)}</Text>
        {item.is_organic && (
          <Text style={styles.organicLabel}>Organic</Text>
        )}
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
          {storeName ? `${storeName} Products` : 'All Products'}
        </Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id.toString()}
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
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  productInfo: {
    gap: SIZES.padding * 0.2,
  },
  productName: {
    fontSize: SIZES.fontSize.subtitle,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  productUnit: {
    fontSize: SIZES.fontSize.small,
    color: COLORS.gray,
  },
  productPrice: {
    fontSize: SIZES.fontSize.body,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  productRating: {
    fontSize: SIZES.fontSize.small,
    color: COLORS.gray,
  },
  organicLabel: {
    fontSize: SIZES.fontSize.small,
    color: COLORS.success,
    fontWeight: 'bold',
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
});

export default withBrownStatusBar(ProductsScreen); 