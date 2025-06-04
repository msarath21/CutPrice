import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import StatusBar from '../components/StatusBar';

const dummyProducts = {
  'Fruits & Vegetables': [
    { id: '1', name: 'Apples', price: '1.99/lb', organic: true },
    { id: '2', name: 'Bananas', price: '0.59/lb', organic: false },
    { id: '3', name: 'Carrots', price: '0.99/lb', organic: true },
  ],
  'Dairy & Eggs': [
    { id: '1', name: 'Whole Milk', price: '3.49/gal', organic: false },
    { id: '2', name: 'Eggs', price: '4.99/dozen', organic: true },
    { id: '3', name: 'Yogurt', price: '1.99/each', organic: false },
  ],
  'Beverages': [
    { id: '1', name: 'Water', price: '0.99/bottle', organic: false },
    { id: '2', name: 'Orange Juice', price: '4.99/gal', organic: true },
    { id: '3', name: 'Coffee', price: '9.99/lb', organic: true },
  ],
  'Snacks': [
    { id: '1', name: 'Chips', price: '3.99/bag', organic: false },
    { id: '2', name: 'Nuts', price: '6.99/lb', organic: true },
    { id: '3', name: 'Cookies', price: '4.99/pack', organic: false },
  ],
};

export default function ProductsScreen({ route, navigation }) {
  const { category } = route.params;
  const products = dummyProducts[category] || [];

  const renderProduct = ({ item }) => (
    <TouchableOpacity style={styles.productCard}>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>{item.price}</Text>
      </View>
      {item.organic && (
        <View style={styles.organicBadge}>
          <Text style={styles.organicText}>Organic</Text>
        </View>
      )}
    </TouchableOpacity>
  );

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
          <Text style={styles.headerTitle}>{category}</Text>
        </View>

        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.productList}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  safeArea: {
    flex: 1,
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
  productList: {
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
    borderWidth: 1,
    borderColor: COLORS.lightGray,
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
  productPrice: {
    fontSize: SIZES.fontSize.body,
    color: COLORS.primary,
  },
  organicBadge: {
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: SIZES.radius,
    marginLeft: SIZES.padding,
  },
  organicText: {
    fontSize: SIZES.fontSize.small,
    color: '#1E8E3E',
  },
}); 