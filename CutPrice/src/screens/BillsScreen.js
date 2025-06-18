import React, { useState, useEffect } from 'react';
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
import * as FileSystem from 'expo-file-system';
import { withBrownStatusBar } from '../utils/screenUtils';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const ITEM_WIDTH = (width - (SIZES.padding * 3)) / COLUMN_COUNT;
const STATUSBAR_HEIGHT = RNStatusBar.currentHeight || 0;

// Import the header image
const headerLogo = require('../../assets/header.png');

// Create a directory for storing receipts
const RECEIPTS_DIRECTORY = `${FileSystem.documentDirectory}receipts`;
const SERVER_URL = 'http://10.0.0.169:3000';

function BillsScreen({ navigation }) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setupStorage();
  }, []);

  const setupStorage = async () => {
    try {
      const dirInfo = await FileSystem.getInfoAsync(RECEIPTS_DIRECTORY);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(RECEIPTS_DIRECTORY, { intermediates: true });
      }
      loadExistingReceipts();
    } catch (error) {
      console.error('Error setting up storage:', error);
    }
  };

  const loadExistingReceipts = async () => {
    try {
      // Load local files
      const files = await FileSystem.readDirectoryAsync(RECEIPTS_DIRECTORY);
      const localReceipts = await Promise.all(files
        .filter(file => file.endsWith('.jpg') || file.endsWith('.png'))
        .map(async (file) => {
          const fileInfo = await FileSystem.getInfoAsync(`${RECEIPTS_DIRECTORY}/${file}`);
          return {
            id: file.split('.')[0],
            uri: fileInfo.uri,
            timestamp: new Date(fileInfo.modificationTime * 1000).toLocaleString(),
            type: 'gallery'
          };
        }));

      // Load server files
      try {
        const serverResponse = await fetch(`${SERVER_URL}/images`);
        if (serverResponse.ok) {
          const serverImages = await serverResponse.json();
          const serverReceipts = serverImages.map(img => ({
            id: img.filename.split('.')[0],
            uri: img.url,
            timestamp: new Date(img.timestamp).toLocaleString(),
            type: 'server'
          }));
          
          // Combine local and server receipts, removing duplicates by id
          const allReceipts = [...localReceipts, ...serverReceipts];
          const uniqueReceipts = Array.from(new Map(allReceipts.map(item => [item.id, item])).values());
          setReceipts(uniqueReceipts);
        } else {
          setReceipts(localReceipts);
        }
      } catch (serverError) {
        console.error('Error loading server receipts:', serverError);
        setReceipts(localReceipts);
      }
    } catch (error) {
      console.error('Error loading existing receipts:', error);
    }
  };

  const saveToStorage = async (uri, filename) => {
    try {
      // First save locally
      const destPath = `${RECEIPTS_DIRECTORY}/${filename}`;
      await FileSystem.copyAsync({
        from: uri,
        to: destPath
      });

      // Then upload to server with retry logic
      let retryCount = 0;
      const maxRetries = 3;
      let lastError = null;

      while (retryCount < maxRetries) {
        try {
          // Convert image to base64 for reliable upload
          const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });

          const formData = new FormData();
          formData.append('image', {
            uri: `data:image/jpeg;base64,${base64}`,
            type: 'image/jpeg',
            name: filename
          });

          const response = await fetch(`${SERVER_URL}/upload`, {
            method: 'POST',
            body: formData,
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
          }

          const serverResponse = await response.json();
          if (retryCount > 0) {
            console.log(`Upload succeeded on attempt ${retryCount + 1}`);
          } else {
            console.log('Upload succeeded on first attempt');
          }
          console.log('Server response:', serverResponse);
          break; // Success, exit retry loop
        } catch (uploadError) {
          lastError = uploadError;
          if (retryCount < maxRetries - 1) {
            console.log(`Upload attempt ${retryCount + 1} failed, retrying...`);
          } else {
            console.log(`Upload attempt ${retryCount + 1} failed (final attempt)`);
          }
          retryCount++;
          
          if (retryCount < maxRetries) {
            // Wait before retrying (exponential backoff)
            const delay = 1000 * Math.pow(2, retryCount);
            console.log(`Waiting ${delay/1000} seconds before next attempt...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      if (retryCount === maxRetries && lastError) {
        console.error('All upload attempts failed:', lastError);
        // Continue with local save even if server upload fails
      }

      return destPath;
    } catch (error) {
      console.error('Error saving file:', error);
      throw error;
    }
  };

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
      try {
        const timestamp = Date.now();
        const filename = `receipt_${timestamp}.jpg`;
        const savedUri = await saveToStorage(result.assets[0].uri, filename);
        
        const newReceipt = {
          id: timestamp.toString(),
          uri: savedUri,
          timestamp: new Date().toLocaleString(),
          type: 'gallery'
        };
        setReceipts(prevReceipts => [newReceipt, ...prevReceipts]);
      } catch (error) {
        Alert.alert('Error', 'Failed to save receipt');
      }
    }
  };

  const takePhoto = async () => {
    setIsModalVisible(false);
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.7,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const timestamp = Date.now();
        const filename = `receipt_${timestamp}.jpg`;
        
        try {
          // Show loading indicator
          setLoading(true);
          
          const savedUri = await saveToStorage(result.assets[0].uri, filename);
          
          const newReceipt = {
            id: timestamp.toString(),
            uri: savedUri,
            timestamp: new Date().toLocaleString(),
            type: 'camera'
          };
          setReceipts(prevReceipts => [newReceipt, ...prevReceipts]);
          
          // Refresh the receipts list
          await loadExistingReceipts();

          // Show success message
          Alert.alert(
            'Success',
            'Receipt saved successfully!',
            [{ text: 'OK' }]
          );
        } catch (saveError) {
          console.error('Save error:', saveError);
          Alert.alert(
            'Upload Warning',
            'Image saved locally but might have issues with server upload.',
            [{ text: 'OK' }]
          );
        } finally {
          setLoading(false);
        }
      }
    } catch (cameraError) {
      console.error('Camera error:', cameraError);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const deleteReceipt = async (item) => {
    try {
      // Show confirmation dialog
      Alert.alert(
        'Delete Receipt',
        'Are you sure you want to delete this receipt?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                // Delete from local storage
                if (item.uri.startsWith(FileSystem.documentDirectory)) {
                  await FileSystem.deleteAsync(item.uri);
                }

                // Remove from state
                setReceipts(prevReceipts => 
                  prevReceipts.filter(receipt => receipt.id !== item.id)
                );

              } catch (error) {
                console.error('Delete error:', error);
                Alert.alert('Error', 'Failed to delete receipt');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Error', 'Failed to delete receipt');
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
        <View style={styles.receiptDetails}>
          <MaterialIcons 
            name={item.type === 'camera' ? 'camera-alt' : 'photo-library'} 
            size={16} 
            color={COLORS.gray}
          />
          <Text style={styles.receiptTimestamp}>{item.timestamp}</Text>
        </View>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => deleteReceipt(item)}
        >
          <MaterialIcons name="delete" size={20} color={COLORS.error} />
        </TouchableOpacity>
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
    justifyContent: 'space-between',
  },
  receiptDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.base,
    flex: 1,
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
  deleteButton: {
    padding: 4,
  },
});

export default withBrownStatusBar(BillsScreen); 