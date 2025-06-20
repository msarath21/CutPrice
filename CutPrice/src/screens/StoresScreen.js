import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  Platform, 
  ActivityIndicator,
  FlatList,
  ScrollView,
  Dimensions,
  StatusBar as RNStatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';
import CustomStatusBar from '../components/StatusBar';
import { withBrownStatusBar } from '../utils/screenUtils';
import { storeService } from '../services/storeService';
import { fetchStores } from '../services/api';

const SCREEN_WIDTH = Dimensions.get('window').width;
const TAB_WIDTH = SCREEN_WIDTH / 3; // Divide screen into 3 equal parts for tabs

// Import the header image
const headerLogo = require('../../assets/header.png');

// Fallback data in case API fails
const fallbackStores = [
  { id: 1, name: 'Walmart Supercenter', address: '123 Main St, City, State' },
  { id: 2, name: 'Costco Wholesale', address: '456 Market St, City, State' },
  { id: 3, name: 'India Cash & Carry', address: '789 Commerce St, City, State' },
];

function StoresScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('all');
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data;
      if (activeTab === 'all') {
        data = await storeService.getAllStores();
      } else if (activeTab === 'nearby') {
        data = await storeService.getNearbyStores();
      } else {
        data = await storeService.getFavoriteStores();
      }
      
      setStores(data);
    } catch (err) {
      console.error('Error loading stores:', err);
      setError('Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  const renderStore = useCallback(({ item }) => (
    <TouchableOpacity
      style={styles.storeCard}
      onPress={() => navigation.navigate('StoreDetails', { store: item })}
    >
      <View style={styles.storeInfo}>
        <MaterialIcons name="store" size={24} color={COLORS.primary} />
        <View style={styles.storeTextContainer}>
          <Text style={styles.storeName}>{item.name}</Text>
          <Text style={styles.storeAddress}>{item.address}</Text>
          {item.distance && (
            <Text style={styles.storeDistance}>{item.distance.toFixed(1)} km</Text>
          )}
        </View>
        <MaterialIcons name="chevron-right" size={24} color={COLORS.gray} />
      </View>
    </TouchableOpacity>
  ), [navigation]);

  const renderTabs = () => {
    const tabs = ['all', 'nearby', 'favorites'];
    return (
      <View style={styles.tabContainer}>
        {tabs.map((tabName) => (
          <TouchableOpacity
            key={tabName}
            style={[
              styles.tab,
              activeTab === tabName && styles.activeTab
            ]}
            onPress={() => setActiveTab(tabName)}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === tabName ? COLORS.primary : COLORS.gray }
              ]}
            >
              {tabName.charAt(0).toUpperCase() + tabName.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomStatusBar />
      <View style={styles.statusBarBackground} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => navigation.goBack()}
            >
              <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Stores</Text>
            <View style={styles.headerButton} />
          </View>
        </View>

        {renderTabs()}

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <FlatList
            data={stores}
            renderItem={renderStore}
            keyExtractor={(item) => (item._id || item.id || Math.random().toString()).toString()}
            contentContainerStyle={styles.storeList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No stores found</Text>
              </View>
            )}
          />
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
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    ...SHADOWS.light,
  },
  headerTitle: {
    fontSize: SIZES.large,
    fontFamily: FONTS.medium,
    color: COLORS.black,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  tab: {
    paddingVertical: SIZES.padding,
    paddingHorizontal: SIZES.large,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: SIZES.font,
    fontFamily: FONTS.medium,
  },
  storeList: {
    padding: SIZES.padding,
  },
  storeCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding,
    ...SHADOWS.light,
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  storeTextContainer: {
    flex: 1,
    marginHorizontal: SIZES.padding,
  },
  storeName: {
    fontSize: SIZES.font,
    fontFamily: FONTS.medium,
    color: COLORS.black,
  },
  storeAddress: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginTop: SIZES.base,
  },
  storeDistance: {
    fontSize: SIZES.small,
    color: COLORS.primary,
    marginTop: SIZES.base,
  },
  errorText: {
    color: COLORS.error,
    textAlign: 'center',
    marginTop: SIZES.padding,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: SIZES.padding * 2,
  },
  emptyStateText: {
    fontSize: SIZES.font,
    color: COLORS.gray,
    fontFamily: FONTS.regular,
  },
});

export default StoresScreen; 