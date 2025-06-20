import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const mockNotifications = [
  {
    id: '1',
    title: 'New Deals Available',
    message: 'Check out new deals on fresh produce!',
    time: '2 hours ago',
    isRead: false,
  },
  {
    id: '2',
    title: 'Price Drop Alert',
    message: 'Prices dropped for items in your wishlist',
    time: '5 hours ago',
    isRead: true,
  },
  // Add more mock notifications as needed
];

const NotificationsScreen = () => {
  const renderNotification = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.notificationItem,
        !item.isRead && styles.unreadNotification
      ]}
    >
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationTime}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>
      
      <FlatList
        data={mockNotifications}
        renderItem={renderNotification}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.notificationsList}
        showsVerticalScrollIndicator={false}
      />
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
  notificationsList: {
    padding: SIZES.padding,
  },
  notificationItem: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.base,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  unreadNotification: {
    backgroundColor: COLORS.lightGray,
  },
  notificationContent: {
    gap: SIZES.base,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
  },
  notificationMessage: {
    fontSize: 14,
    color: COLORS.gray,
  },
  notificationTime: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
  },
});

export default NotificationsScreen; 