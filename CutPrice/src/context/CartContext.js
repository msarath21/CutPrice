import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState({});
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    loadCart();
  }, []);

  useEffect(() => {
    // Update total items whenever cart changes
    const total = Object.values(cartItems).reduce((sum, store) => {
      return sum + store.reduce((storeSum, item) => storeSum + (item.quantity || 0), 0);
    }, 0);
    setTotalItems(total);

    // Save to AsyncStorage whenever cart changes
    const saveCart = async () => {
      try {
        await AsyncStorage.setItem('cart', JSON.stringify(cartItems));
      } catch (error) {
        console.error('Error saving cart:', error);
      }
    };
    saveCart();
  }, [cartItems]);

  const loadCart = async () => {
    try {
      const savedCart = await AsyncStorage.getItem('cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const addToCart = async (store, item) => {
    try {
      setCartItems(prevCart => {
        const updatedCart = { ...prevCart };
        if (!updatedCart[store]) {
          updatedCart[store] = [];
        }

        const existingItemIndex = updatedCart[store].findIndex(i => i.name === item.name);
        
        if (existingItemIndex >= 0) {
          updatedCart[store][existingItemIndex].quantity += 1;
        } else {
          updatedCart[store].push({
            id: Date.now().toString(),
            name: item.name,
            price: item.price,
            quantity: 1
          });
        }

        return updatedCart;
      });
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  };

  const removeFromCart = async (store, itemId) => {
    try {
      setCartItems(prevCart => {
        const updatedCart = { ...prevCart };
        if (!updatedCart[store]) return prevCart;

        updatedCart[store] = updatedCart[store].filter(item => item.id !== itemId);
        
        if (updatedCart[store].length === 0) {
          delete updatedCart[store];
        }
        
        return updatedCart;
      });
      return true;
    } catch (error) {
      console.error('Error removing from cart:', error);
      return false;
    }
  };

  const getStoreTotal = (store) => {
    if (!cartItems[store]) return 0;
    return cartItems[store].reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  };

  const getStoreItemCount = (store) => {
    if (!cartItems[store]) return 0;
    return cartItems[store].reduce((sum, item) => sum + (item.quantity || 1), 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      totalItems,
      addToCart,
      removeFromCart,
      getStoreTotal,
      getStoreItemCount
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
} 