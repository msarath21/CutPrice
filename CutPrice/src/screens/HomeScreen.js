import React, { useState, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList,
  TextInput,
  ActivityIndicator,
  Image,
  Platform,
  StatusBar as RNStatusBar,
  SafeAreaView,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';
import CustomStatusBar from '../components/StatusBar';
import { searchItems } from '../utils/searchUtils';

// Import the header image
const headerLogo = require('../../assets/header.png');

const categories = [
  { id: 1, name: 'Fruits &\nVegetables', icon: 'leaf', type: 'Ionicons', screen: 'Products' },
  { id: 2, name: 'Dairy & Eggs', icon: 'egg', type: 'Ionicons', screen: 'Products' },
  { id: 3, name: 'Beverages', icon: 'beer', type: 'Ionicons', screen: 'Products' },
  { id: 4, name: 'Snacks', icon: 'restaurant', type: 'Ionicons', screen: 'Products' },
  { id: 5, name: 'Bills', icon: 'receipt', type: 'MaterialIcons', screen: 'Bills' },
];

export default function HomeScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);

  // Memoize categories to prevent unnecessary re-renders
  const memoizedCategories = useMemo(() => categories, []);

  // Debounce search to prevent too many API calls
  const handleSearch = useCallback(async (text) => {
    setSearchQuery(text);
    if (text.length >= 2) {
      setLoading(true);
      setShowResults(true);
      // Add delay to prevent too frequent API calls
      const timeoutId = setTimeout(async () => {
        const results = await searchItems(text);
        setSearchResults(results);
        setLoading(false);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setShowResults(false);
      setSearchResults([]);
    }
  }, []);

  // Memoize render functions to prevent recreating on every render
  const renderSearchResult = useCallback(({ item }) => (
    <View style={styles.searchResultItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.storeName}>{item.store}</Text>
      </View>
      <View style={styles.priceContainer}>
        <Text 
          style={[
            styles.price,
            item.priceType === 'lowest' && styles.lowestPrice,
            item.priceType === 'highest' && styles.highestPrice,
          ]}
        >
          ${Number(item.price).toFixed(2)}
        </Text>
        {item.is_organic && (
          <View style={styles.organicBadge}>
            <Text style={styles.organicText}>Organic</Text>
          </View>
        )}
      </View>
    </View>
  ), []);

  const keyExtractor = useCallback((item, index) => 
    `${item.name}-${item.store}-${index}`, []);

  return (
    <View style={styles.container}>
      <CustomStatusBar />
      <View style={styles.statusBarBackground} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => navigation.navigate('Stores')}
            >
              <MaterialIcons name="location-on" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <Image source={headerLogo} style={styles.logo} resizeMode="contain" />
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => alert('Profile feature coming soon!')}
            >
              <MaterialIcons name="person" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
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
                onPress={() => {
                  setSearchQuery('');
                  setShowResults(false);
                  setSearchResults([]);
                }}
              >
                <Ionicons name="close-circle" size={20} color={COLORS.gray} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {showResults ? (
          <View style={styles.searchResultsContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
              </View>
            ) : searchResults.length > 0 ? (
              <FlatList
                data={searchResults}
                renderItem={renderSearchResult}
                keyExtractor={keyExtractor}
                contentContainerStyle={styles.searchResultsList}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={5}
                initialNumToRender={10}
              />
            ) : (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>No items found</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.categoriesContainer}>
            {memoizedCategories.map((category, index) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  index === categories.length - 1 && styles.fullWidthCard
                ]}
                onPress={() => navigation.navigate(category.screen, { category: category.name })}
              >
                {category.type === 'Ionicons' ? (
                  <Ionicons name={category.icon} size={32} color={COLORS.white} />
                ) : (
                  <MaterialIcons name={category.icon} size={32} color={COLORS.white} />
                )}
                <Text style={styles.categoryText}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
  logo: {
    height: 40,
    width: 120,
  },
  searchContainer: {
    paddingHorizontal: SIZES.padding,
    marginBottom: SIZES.padding,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    height: 48,
  },
  searchIcon: {
    marginRight: SIZES.base,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: SIZES.font,
    fontFamily: FONTS.regular,
    color: COLORS.black,
  },
  categoriesContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SIZES.padding,
    gap: SIZES.padding,
  },
  categoryCard: {
    width: '47%',
    aspectRatio: 1,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
  fullWidthCard: {
    width: '100%',
    aspectRatio: 3,
  },
  categoryText: {
    color: COLORS.white,
    fontSize: SIZES.font,
    fontFamily: FONTS.medium,
    marginTop: SIZES.base,
    textAlign: 'center',
  },
  searchResultsContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  searchResultsList: {
    padding: SIZES.padding,
  },
  searchResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.base,
    ...SHADOWS.light,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: SIZES.font,
    fontFamily: FONTS.medium,
    color: COLORS.black,
  },
  storeName: {
    fontSize: SIZES.small,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    marginTop: SIZES.base / 2,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: SIZES.font,
    fontFamily: FONTS.medium,
    color: COLORS.black,
  },
  lowestPrice: {
    color: COLORS.success,
  },
  highestPrice: {
    color: COLORS.error,
  },
  organicBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.base,
    paddingVertical: SIZES.base / 2,
    borderRadius: SIZES.radius / 2,
    marginTop: SIZES.base / 2,
  },
  organicText: {
    color: COLORS.white,
    fontSize: SIZES.small,
    fontFamily: FONTS.regular,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  noResultsText: {
    fontSize: SIZES.font,
    fontFamily: FONTS.medium,
    color: COLORS.gray,
  },
}); 