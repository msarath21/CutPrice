import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Dimensions,
  StatusBar,
} from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const cardWidth = (width - (SIZES.padding * 3)) / 2;

const categories = [
  { id: 'C001', name: 'Dairy', image: require('../../assets/catogery/diary.png') },
  { id: 'C002', name: 'Produce', image: require('../../assets/catogery/produce.png') },
  { id: 'C003', name: 'Meat', image: require('../../assets/catogery/meat.png') },
  { id: 'C004', name: 'Bakery', image: require('../../assets/catogery/bakery.png') },
  { id: 'C005', name: 'Grains', image: require('../../assets/catogery/grains.png') },
  { id: 'C006', name: 'Beverages', image: require('../../assets/catogery/bevarages.png') },
  { id: 'C007', name: 'Snacks', image: require('../../assets/catogery/snacks.png') },
  { id: 'C008', name: 'Breakfast', image: require('../../assets/catogery/breakfast.png') },
  { id: 'C009', name: 'Household', image: require('../../assets/catogery/household.png') },
  { id: 'C010', name: 'Baking', image: require('../../assets/catogery/backing.png') },
];

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Image 
          source={require('../../assets/header.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.storeButton}
            onPress={() => navigation.navigate('Stores')}
          >
            <Ionicons name="location" size={24} color={COLORS.primary} />
            <Text style={styles.storeButtonText}>Stores</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Promo Banner */}
      <View style={styles.promoBanner}>
        <Image
          source={require('../../assets/catogery/promo-banner.png')}
          style={styles.promoBannerImage}
          resizeMode="cover"
        />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.gray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor={COLORS.gray}
        />
      </View>

      {/* Categories Grid */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.categoriesGrid}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              onPress={() => navigation.navigate('Products', { 
                category: category.name,
                categoryId: category.id 
              })}
            >
              <Image
                source={category.image}
                style={styles.categoryImage}
                resizeMode="cover"
              />
              <Text style={styles.categoryName}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding,
    paddingBottom: SIZES.padding / 2,
  },
  logo: {
    width: 100,
    height: 40,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SIZES.padding,
    backgroundColor: COLORS.lightGray,
    padding: SIZES.base,
    borderRadius: SIZES.radius,
  },
  storeButtonText: {
    marginLeft: 4,
    color: COLORS.primary,
    fontWeight: '600',
  },
  notificationButton: {
    padding: SIZES.base,
  },
  promoBanner: {
    paddingHorizontal: SIZES.padding,
    marginBottom: SIZES.padding,
  },
  promoBannerImage: {
    width: '100%',
    height: 120,
    borderRadius: SIZES.radius,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding * 1.5,
    paddingVertical: SIZES.base,
    backgroundColor: COLORS.lightGray,
    marginHorizontal: SIZES.padding,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding,
  },
  searchInput: {
    flex: 1,
    marginLeft: SIZES.base,
    fontSize: SIZES.font,
    color: COLORS.black,
  },
  scrollContent: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.padding * 2,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: cardWidth,
    marginBottom: SIZES.padding,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    ...SHADOWS.medium,
  },
  categoryImage: {
    width: '100%',
    height: cardWidth,
    borderRadius: SIZES.radius,
  },
  categoryName: {
    fontSize: SIZES.font,
    fontWeight: '600',
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: SIZES.base,
    marginBottom: SIZES.base,
  },
}); 