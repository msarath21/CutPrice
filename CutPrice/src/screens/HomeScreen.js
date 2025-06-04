import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  TextInput,
  Image,
  Platform,
  StatusBar as RNStatusBar,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import StatusBar from '../components/StatusBar';
import { searchItems } from '../utils/searchUtils';

// Import the header image
const headerLogo = require('../../assets/header.png');

const STATUSBAR_HEIGHT = RNStatusBar.currentHeight || 0;

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

  const handleSearch = async (text) => {
    setSearchQuery(text);
    if (text.length >= 2) {
      setLoading(true);
      setShowResults(true);
      const results = await searchItems(text);
      setSearchResults(results);
      setLoading(false);
    } else {
      setShowResults(false);
      setSearchResults([]);
    }
  };

  const renderSearchResult = ({ item }) => (
    <View style={styles.searchResultItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.Item}</Text>
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
          ${item.Price}
        </Text>
        {item.Organic === 'Yes' && (
          <View style={styles.organicBadge}>
            <Text style={styles.organicText}>Organic</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Image 
              source={headerLogo}
              style={styles.logo}
              resizeMode="contain"
            />
            <View style={styles.headerRight}>
              <TouchableOpacity 
                style={styles.storesButton}
                onPress={() => navigation.navigate('Stores')}
              >
                <MaterialIcons name="location-on" size={20} color={COLORS.primary} />
                <Text style={styles.storesText}>Stores</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.profileButton}>
                <MaterialIcons name="person" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>

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
                  setShowResults(false);
                  setSearchResults([]);
                }}
              >
                <Ionicons name="close-circle" size={20} color={COLORS.gray} />
              </TouchableOpacity>
            )}
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
                  keyExtractor={(item, index) => `${item.Item}-${item.store}-${index}`}
                  contentContainerStyle={styles.searchResultsList}
                />
              ) : (
                <View style={styles.noResultsContainer}>
                  <Text style={styles.noResultsText}>No items found</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.categoriesContainer}>
              {categories.map((category, index) => (
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
        </View>
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
    paddingTop: Platform.OS === 'android' ? STATUSBAR_HEIGHT : 0,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
  },
  logo: {
    height: 40,
    width: 120,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  storesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F5F5F5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  storesText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  profileButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    marginHorizontal: 16,
    marginVertical: 16,
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
  categoriesContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    padding: 16,
  },
  categoryCard: {
    width: '47%',
    aspectRatio: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  fullWidthCard: {
    width: '100%',
    aspectRatio: 3,
  },
  categoryText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '500',
    marginTop: 12,
    textAlign: 'center',
  },
  searchResultsContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  searchResultsList: {
    padding: 16,
  },
  searchResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  itemInfo: {
    flex: 1,
    marginRight: 16,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.black,
    marginBottom: 4,
  },
  storeName: {
    fontSize: 14,
    color: COLORS.gray,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 4,
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
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 32,
  },
  noResultsText: {
    fontSize: 16,
    color: COLORS.gray,
  },
}); 