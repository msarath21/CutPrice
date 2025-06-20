import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { searchItems } from '../utils/searchUtils';

const SearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 0) {
        setIsLoading(true);
        try {
          const results = await searchItems(searchQuery);
          setSearchResults(results);
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const renderSearchResult = ({ item }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => navigation.navigate('Products', { 
        productId: item.id,
        productName: item.name,
        allPrices: item.allPrices
      })}
    >
      <View style={styles.resultContent}>
        <View style={styles.nameContainer}>
          <Text style={styles.resultName}>{item.name}</Text>
          <View style={styles.storeInfoContainer}>
            <Ionicons name="storefront-outline" size={14} color={COLORS.gray} />
            <Text style={styles.storeCount}>
              Available in {item.allPrices.length} store{item.allPrices.length > 1 ? 's' : ''}
            </Text>
          </View>
        </View>
        <View style={styles.rightContainer}>
          {item.is_organic && (
            <View style={styles.organicBadge}>
              <Text style={styles.organicText}>Organic</Text>
            </View>
          )}
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for food, products, or categories..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.gray}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.gray} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : searchResults.length > 0 ? (
        <>
          <View style={styles.resultHeader}>
            <Text style={styles.resultCount}>
              Found {searchResults.length} items
            </Text>
            <Text style={styles.resultHint}>
              Tap an item to see prices from all stores
            </Text>
          </View>
          <FlatList
            data={searchResults}
            renderItem={renderSearchResult}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.resultsList}
            showsVerticalScrollIndicator={false}
          />
        </>
      ) : searchQuery.length > 0 ? (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>No products found</Text>
          <Text style={styles.noResultsSubText}>
            Try searching for food categories like "dairy", "meat", or "snacks"
          </Text>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Search for food items or any products</Text>
          <Text style={styles.emptySubText}>
            Try typing "food" to see all food categories
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: SIZES.padding,
    borderRadius: SIZES.radius,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: SIZES.base,
    fontSize: 14,
  },
  resultsList: {
    padding: SIZES.padding,
  },
  resultItem: {
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  resultContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameContainer: {
    flex: 1,
    marginRight: SIZES.padding,
  },
  resultName: {
    fontSize: 16,
    color: COLORS.black,
    marginBottom: 4,
  },
  storeInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeCount: {
    fontSize: 12,
    color: COLORS.gray,
    marginLeft: 4,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  organicBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: SIZES.base,
  },
  organicText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '500',
  },
  resultHeader: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  resultCount: {
    fontSize: 14,
    color: COLORS.gray,
  },
  resultHint: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
    fontStyle: 'italic',
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
  },
  noResultsText: {
    fontSize: 16,
    color: COLORS.black,
    marginBottom: SIZES.base,
  },
  noResultsSubText: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: SIZES.base,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.black,
    marginBottom: SIZES.base,
  },
  emptySubText: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: SIZES.base,
  },
});

export default SearchScreen; 