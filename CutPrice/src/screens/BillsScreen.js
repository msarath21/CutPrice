import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Platform,
  SafeAreaView,
  FlatList,
  Image,
  Dimensions,
  StatusBar as RNStatusBar,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import StatusBar from '../components/StatusBar';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const ITEM_WIDTH = (width - (SIZES.padding * 3)) / COLUMN_COUNT;
const STATUSBAR_HEIGHT = RNStatusBar.currentHeight || 0;

// Import the header image
const headerLogo = require('../../assets/header.png');

export default function BillsScreen({ navigation }) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [receipts, setReceipts] = useState([]);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera roll permissions to upload images!'
        );
        return false;
      }
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraStatus.status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera permissions to take pictures!'
        );
        return false;
      }
    }
    return true;
  };

  const pickImage = async () => {
    setIsModalVisible(false);
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      const newReceipt = {
        id: Date.now().toString(),
        uri: result.assets[0].uri,
        timestamp: new Date().toLocaleString(),
        type: 'gallery'
      };
      setReceipts(prevReceipts => [newReceipt, ...prevReceipts]);
    }
  };

  const takePhoto = async () => {
    setIsModalVisible(false);
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      const newReceipt = {
        id: Date.now().toString(),
        uri: result.assets[0].uri,
        timestamp: new Date().toLocaleString(),
        type: 'camera'
      };
      setReceipts(prevReceipts => [newReceipt, ...prevReceipts]);
    }
  };

  const renderReceipt = ({ item }) => (
    <TouchableOpacity 
      style={styles.receiptItem}
      onPress={() => {
        // TODO: Add full screen view of receipt
        console.log('View receipt:', item.uri);
      }}
    >
      <Image 
        source={{ uri: item.uri }} 
        style={styles.receiptImage}
        resizeMode="cover"
      />
      <View style={styles.receiptInfo}>
        <MaterialIcons 
          name={item.type === 'camera' ? 'camera-alt' : 'photo-library'} 
          size={16} 
          color={COLORS.gray}
        />
        <Text style={styles.receiptTimestamp}>{item.timestamp}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar />
      <View style={styles.headerContainer}>
        <SafeAreaView style={styles.headerSafeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <Image 
              source={headerLogo}
              style={styles.logo}
              resizeMode="contain"
            />
            <TouchableOpacity onPress={() => setIsModalVisible(true)}>
              <Ionicons name="add" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.title}>Your Receipts</Text>
        
        <FlatList
          data={receipts}
          renderItem={renderReceipt}
          keyExtractor={item => item.id}
          numColumns={COLUMN_COUNT}
          contentContainerStyle={styles.receiptsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <TouchableOpacity 
                style={styles.uploadButton}
                onPress={() => setIsModalVisible(true)}
              >
                <MaterialIcons name="receipt-long" size={32} color={COLORS.primary} />
                <Text style={styles.uploadText}>Upload Receipts</Text>
              </TouchableOpacity>
              <Text style={styles.emptyStateText}>No receipts uploaded yet</Text>
            </View>
          )}
        />
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Receipt</Text>
            
            <TouchableOpacity style={styles.modalButton} onPress={takePhoto}>
              <MaterialIcons name="camera-alt" size={24} color={COLORS.primary} />
              <Text style={styles.modalButtonText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalButton} onPress={pickImage}>
              <MaterialIcons name="photo-library" size={24} color={COLORS.primary} />
              <Text style={styles.modalButtonText}>Choose from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={[styles.modalButtonText, styles.cancelButtonText]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  headerContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    paddingTop: Platform.OS === 'android' ? STATUSBAR_HEIGHT : 0,
    zIndex: 2,
    elevation: Platform.OS === 'android' ? 4 : 0,
    shadowColor: Platform.OS === 'ios' ? '#000' : undefined,
    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 2 } : undefined,
    shadowOpacity: Platform.OS === 'ios' ? 0.2 : undefined,
    shadowRadius: Platform.OS === 'ios' ? 2 : undefined,
  },
  headerSafeArea: {
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    height: 56,
  },
  logo: {
    height: 40,
    width: 120,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
  },
  title: {
    fontSize: SIZES.fontSize.title,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: SIZES.padding,
  },
  receiptsList: {
    gap: SIZES.padding,
  },
  receiptItem: {
    width: ITEM_WIDTH,
    marginBottom: SIZES.padding,
    marginRight: SIZES.padding,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.white,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  receiptImage: {
    width: '100%',
    height: ITEM_WIDTH * 1.4,
    borderRadius: SIZES.radius,
  },
  receiptInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.base,
    gap: SIZES.base,
  },
  receiptTimestamp: {
    fontSize: SIZES.fontSize.small,
    color: COLORS.gray,
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.padding * 2,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.white,
    marginBottom: SIZES.padding,
    gap: SIZES.base,
  },
  uploadText: {
    fontSize: SIZES.fontSize.body,
    fontWeight: FONTS.semiBold,
    color: COLORS.primary,
  },
  emptyStateText: {
    fontSize: SIZES.fontSize.body,
    color: COLORS.gray,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SIZES.padding,
  },
  modalTitle: {
    fontSize: SIZES.fontSize.title,
    fontWeight: FONTS.bold,
    color: COLORS.primary,
    marginBottom: SIZES.padding,
    textAlign: 'center',
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.lightGray,
    marginBottom: SIZES.base,
  },
  modalButtonText: {
    fontSize: SIZES.fontSize.body,
    fontWeight: FONTS.semiBold,
    color: COLORS.primary,
    marginLeft: SIZES.padding,
  },
  cancelButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginTop: SIZES.base,
  },
  cancelButtonText: {
    color: COLORS.primary,
  },
}); 