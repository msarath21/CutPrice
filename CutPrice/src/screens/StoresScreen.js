import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import StatusBar from '../components/StatusBar';
import { withBrownStatusBar } from '../utils/screenUtils';

// Fallback data in case API fails
const fallbackStores = [
  { _id: 1, name: 'Walmart Supercenter', address: '123 Main St, City, State' },
  { _id: 2, name: 'Costco Wholesale', address: '456 Market St, City, State' },
  { _id: 3, name: 'India Cash & Carry', address: '789 Commerce St, City, State' },
];

function StoresScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('Nearby');
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://10.0.0.169:3000/api/stores');
      if (!response.ok) {
        throw new Error('Failed to fetch stores');
      }
      
      const data = await response.json();
      setStores(data);
    } catch (err) {
      console.error('Error fetching stores:', err);
      setError('Failed to load stores');
      setStores(fallbackStores);
    } finally {
      setLoading(false);
    }
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
      <StatusBar />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Stores</Text>
        </View>

        <View style={styles.tabContainer}>
          {['Nearby', 'Previous', 'Favorites'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        <View style={styles.storeList}>
          {stores.map(store => (
            <TouchableOpacity 
              key={store._id}
              style={styles.storeCard}
              onPress={() => navigation.navigate('StoreDetails', { store })}
            >
              <MaterialIcons name="store" size={24} color={COLORS.primary} />
              <View style={styles.storeInfo}>
                <Text style={styles.storeName}>{store.name}</Text>
                <Text style={styles.storeAddress}>{store.address}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={COLORS.gray} />
            </TouchableOpacity>
          ))}
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
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
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  tab: {
    paddingVertical: SIZES.padding,
    marginRight: SIZES.padding * 2,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: SIZES.fontSize.subtitle,
    color: COLORS.gray,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  storeList: {
    padding: SIZES.padding,
  },
  storeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.gray,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  storeInfo: {
    flex: 1,
    marginLeft: SIZES.padding,
  },
  storeName: {
    fontSize: SIZES.fontSize.subtitle,
    fontWeight: '500',
    color: COLORS.black,
    marginBottom: 4,
  },
  storeAddress: {
    fontSize: SIZES.fontSize.body,
    color: COLORS.gray,
  },
  errorText: {
    color: COLORS.error,
    textAlign: 'center',
    padding: SIZES.padding,
  },
});

export default withBrownStatusBar(StoresScreen); 