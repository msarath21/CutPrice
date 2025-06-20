import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';

const CartScreen = () => {
  const { cartItems, removeFromCart, getStoreTotal, getStoreItemCount } = useCart();
  const [expandedStore, setExpandedStore] = useState(null);

  const handleProceedToStore = async (store) => {
    if (store.toLowerCase() === 'walmart') {
      try {
        const walmartAppUrl = Platform.select({
          ios: 'walmart://',
          android: 'market://details?id=com.walmart.android',
        });
        
        const canOpenApp = await Linking.canOpenURL(walmartAppUrl);
        
        if (canOpenApp) {
          await Linking.openURL(walmartAppUrl);
        } else {
          await Linking.openURL('https://www.walmart.com/cart');
        }
      } catch (error) {
        console.error('Error opening Walmart:', error);
        await Linking.openURL('https://www.walmart.com/cart');
      }
    }
  };

  const renderStoreItem = ({ item: store }) => {
    const itemCount = getStoreItemCount(store);
    const total = getStoreTotal(store);
    const isExpanded = expandedStore === store;

    return (
      <View style={styles.storeSection}>
        <TouchableOpacity
          style={styles.storeSummary}
          onPress={() => setExpandedStore(isExpanded ? null : store)}
        >
          <View style={styles.storeTitleContainer}>
            <View style={styles.storeIconTitle}>
              <Ionicons name="storefront-outline" size={24} color={COLORS.primary} />
              <Text style={styles.storeTitle}>{store}</Text>
            </View>
            <Text style={styles.itemCount}>
              {itemCount} item{itemCount !== 1 ? 's' : ''}
            </Text>
          </View>
          <View style={styles.storeInfoRight}>
            <Text style={styles.storeTotal}>
              ${total.toFixed(2)}
            </Text>
            <Ionicons 
              name={isExpanded ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={COLORS.gray} 
            />
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.storeItems}>
            {cartItems[store].map((item) => (
              <View key={item.id} style={styles.cartItem}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>
                    ${item.price.toFixed(2)} × {item.quantity}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => removeFromCart(store, item.id)}
                  style={styles.removeButton}
                >
                  <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            ))}

            {store.toLowerCase() === 'walmart' && (
              <TouchableOpacity
                style={styles.proceedButton}
                onPress={() => handleProceedToStore(store)}
              >
                <Text style={styles.proceedButtonText}>
                  Proceed to {store} Cart
                </Text>
                <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  const stores = Object.keys(cartItems);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shopping Cart</Text>
      </View>
      
      {stores.length > 0 ? (
        <FlatList
          data={stores}
          renderItem={renderStoreItem}
          keyExtractor={store => store}
          contentContainerStyle={styles.cartList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyCart}>
          <Ionicons name="cart-outline" size={64} color={COLORS.gray} />
          <Text style={styles.emptyCartText}>Your cart is empty</Text>
          <Text style={styles.emptyCartSubText}>
            Add items from product search to start shopping
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.primary,
  },
  cartList: {
    padding: SIZES.padding,
  },
  storeSection: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    overflow: 'hidden',
  },
  storeSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding,
    backgroundColor: COLORS.lightGray,
  },
  storeTitleContainer: {
    flex: 1,
    marginRight: SIZES.padding,
  },
  storeIconTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 8,
  },
  itemCount: {
    fontSize: 14,
    color: COLORS.gray,
    marginLeft: 32,
    marginTop: 4,
  },
  storeInfoRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginRight: SIZES.padding,
  },
  storeItems: {
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    color: COLORS.black,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 12,
    color: COLORS.gray,
  },
  removeButton: {
    padding: 8,
  },
  proceedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: SIZES.padding,
    margin: SIZES.padding,
    borderRadius: SIZES.radius,
  },
  proceedButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding * 2,
  },
  emptyCartText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.black,
    marginTop: SIZES.padding,
  },
  emptyCartSubText: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: SIZES.base,
  },
});

export default CartScreen; 