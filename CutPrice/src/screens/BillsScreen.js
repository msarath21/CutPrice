import React, { useState, useEffect, useCallback } from 'react';
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
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';
import CustomStatusBar from '../components/StatusBar';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { withBrownStatusBar } from '../utils/screenUtils';
import { ref, deleteObject } from 'firebase/storage';
import { storage } from '../firebase/firebaseConfig';
import headerLogo from '../../assets/header.png';
import { searchItems } from '../utils/searchUtils';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const CARD_MARGIN = SIZES.base;
const CARD_WIDTH = (width - (COLUMN_COUNT + 1) * CARD_MARGIN * 2) / COLUMN_COUNT;
const STATUSBAR_HEIGHT = RNStatusBar.currentHeight || 44;
const HEADER_HEIGHT = 56;
const TOTAL_HEADER_HEIGHT = STATUSBAR_HEIGHT + HEADER_HEIGHT;

// Create a directory for storing receipts
const RECEIPTS_DIRECTORY = `${FileSystem.documentDirectory}receipts`;
import { getServerUrl } from '../config/serverConfig';
const SERVER_URL = getServerUrl();

function BillsScreen({ navigation }) {
  const [receipts, setReceipts] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReceipts, setSelectedReceipts] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setupStorage();
    loadExistingReceipts();
  }, []);

  const clearError = () => {
    setError(null);
  };

  const handleError = (error, context = '') => {
    console.error(`Error ${context}:`, error);
    setError(error.message || 'An unexpected error occurred');
    // Auto-clear error after 5 seconds
    setTimeout(clearError, 5000);
  };

  const retryLastAction = async () => {
    try {
      setLoading(true);
      clearError();
      await loadExistingReceipts();
    } catch (error) {
      handleError(error, 'retrying last action');
    } finally {
      setLoading(false);
    }
  };

  const setupStorage = async () => {
    try {
      const dirInfo = await FileSystem.getInfoAsync(RECEIPTS_DIRECTORY);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(RECEIPTS_DIRECTORY, { intermediates: true });
      }
      // Create excel directory if it doesn't exist
      const excelDir = `${FileSystem.documentDirectory}excel`;
      const excelDirInfo = await FileSystem.getInfoAsync(excelDir);
      if (!excelDirInfo.exists) {
        await FileSystem.makeDirectoryAsync(excelDir, { intermediates: true });
      }
      await loadExistingReceipts();
    } catch (error) {
      console.error('Error setting up storage:', error);
      Alert.alert('Error', 'Failed to initialize storage. Please restart the app.');
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

  const loadExistingReceipts = async () => {
    try {
      setLoading(true);
      // Load local files first
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

      // Set local receipts first
      setReceipts(localReceipts);

      // Then try to load server files
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
          setReceipts(uniqueReceipts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
        }
      } catch (serverError) {
        console.warn('Error loading server receipts:', serverError);
        // Continue with local receipts only
      }
    } catch (error) {
      console.error('Error loading receipts:', error);
      Alert.alert('Error', 'Failed to load receipts');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      if (!await requestPermissions()) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setIsModalVisible(false);
        const asset = result.assets[0];
        const filename = `receipt_${Date.now()}.jpg`;
        await saveToStorage(asset.uri, filename);
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', 'Failed to process image from gallery');
    }
  };

  const takePhoto = async () => {
    try {
      if (!await requestPermissions()) return;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setIsModalVisible(false);
        const asset = result.assets[0];
        const filename = `receipt_${Date.now()}.jpg`;
        await saveToStorage(asset.uri, filename);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to process camera image');
    }
  };

  const saveToStorage = async (uri, filename) => {
    try {
      setLoading(true); // Show loading state
      
      // Save locally first
      const destPath = `${RECEIPTS_DIRECTORY}/${filename}`;
      await FileSystem.copyAsync({
        from: uri,
        to: destPath
      });

      // Verify the file was saved locally
      const fileInfo = await FileSystem.getInfoAsync(destPath);
      if (!fileInfo.exists) {
        throw new Error('Failed to save receipt locally');
      }

      // Try to upload to server
      try {
        const formData = new FormData();
        formData.append('image', {
          uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
          type: 'image/jpeg',
          name: filename
        });

        const response = await fetch(`${SERVER_URL}/upload`, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json',
          },
        });

        const serverResponse = await response.json();

        if (!response.ok) {
          throw new Error(serverResponse.error || 'Failed to process receipt');
        }

        if (serverResponse.data) {
          if (!serverResponse.data.items || serverResponse.data.items.length === 0) {
            // Delete the local file since it's not a valid receipt
            await FileSystem.deleteAsync(destPath);
            throw new Error(
              'No items found in the receipt. Please make sure:\n\n' +
              '• The image is clear and well-lit\n' +
              '• All prices are visible\n' +
              '• The receipt text is readable\n' +
              '• The image is not blurry'
            );
          }
          await handleReceiptProcessed(serverResponse.data);
          
          // Show success message
          Alert.alert(
            'Success',
            `Receipt processed successfully!\nFound ${serverResponse.data.items.length} items.`,
            [{ text: 'OK', onPress: () => setShowSuccess(true) }]
          );
        }
      } catch (uploadError) {
        // Delete the local file if server processing failed
        await FileSystem.deleteAsync(destPath);
        throw new Error(uploadError.message || 'Failed to process receipt');
      }

      // Reload receipts list after successful processing
      await loadExistingReceipts();
      return destPath;
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert(
        'Receipt Processing Failed',
        error.message || 'Failed to process receipt. Please try again with a clearer image.',
        [
          { 
            text: 'OK',
            style: 'default'
          },
          {
            text: 'Try Again',
            onPress: () => setIsModalVisible(true),
            style: 'cancel'
          }
        ]
      );
      throw error;
    } finally {
      setLoading(false); // Hide loading state
    }
  };

  const deleteReceipt = async (receipt) => {
    if (!receipt || !receipt.id) return;

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
              setLoading(true);
              
              // Delete local file if it exists
              if (receipt.uri) {
                try {
                  await FileSystem.deleteAsync(receipt.uri, { idempotent: true });
                } catch (err) {
                  console.log('Local file deletion error:', err);
                }
              }
              
              // Delete from local state
              setReceipts(prevReceipts => prevReceipts.filter(r => r.id !== receipt.id));
              
            } catch (error) {
              handleError(error, 'deleting receipt');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const generateExcel = async (receiptData) => {
    try {
      console.log('Generating Excel for receipt data:', receiptData);
      
      const response = await fetch(`${SERVER_URL}/api/generate-excel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(receiptData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate Excel file');
      }

      const result = await response.json();
      console.log('Excel generation result:', result);

      // Download the Excel file
      if (result.data && result.data.filePath) {
        const filename = result.data.filename;
        const excelDestPath = `${FileSystem.documentDirectory}excel/${filename}`;
        
        // Download the file
        await FileSystem.downloadAsync(
          `${SERVER_URL}/excel/${filename}`,
          excelDestPath
        );

        console.log('Excel file saved to:', excelDestPath);
      }
    } catch (error) {
      console.error('Error generating Excel:', error);
      Alert.alert(
        'Error',
        `Failed to generate Excel file: ${error.message}`
      );
    }
  };

  const handleReceiptProcessed = async (receiptData) => {
    try {
      clearError(); // Clear any existing errors

      if (!receiptData.success) {
        // Show the specific error details if available
        throw new Error(receiptData.details || receiptData.error || 'Failed to process receipt');
      }

      // Check if we have valid items
      if (!receiptData.items || receiptData.items.length === 0) {
        console.error('Receipt data:', JSON.stringify(receiptData, null, 2));
        
        // Check if we have partial data
        if (receiptData.partialData) {
          throw new Error(
            `Could not find any items in the receipt from ${receiptData.partialData.storeName} ` +
            `dated ${receiptData.partialData.date}.\n\n` +
            'Please ensure the receipt image is clear and all prices are visible.'
          );
        }

        throw new Error(
          receiptData.details || 
          'No items found in receipt. The OCR process could not identify any items with prices. ' +
          'Please make sure the receipt image is clear and well-lit.'
        );
      }

      // Format data for Excel generation
      const excelData = {
        storeName: receiptData.storeName,
        date: receiptData.date,
        items: receiptData.items.map(item => ({
          name: item.name,
          price: item.price
        }))
      };

      // Generate Excel file
      await generateExcel(excelData);

      // Show success message with details
      Alert.alert(
        'Success',
        `Receipt processed successfully!\n\n` +
        `Store: ${receiptData.storeName}\n` +
        `Date: ${receiptData.date}\n` +
        `Items found: ${receiptData.items.length}\n` +
        `Total amount: $${receiptData.items.reduce((sum, item) => sum + item.price, 0).toFixed(2)}`
      );

      // Clear any existing errors after success
      clearError();
    } catch (error) {
      handleError(error, 'processing receipt');
      
      // Determine if this is a screenshot error
      const isScreenshotError = error.message.includes('screenshot') || 
                               error.message.includes('error message');

      // Show detailed error message
      Alert.alert(
        isScreenshotError ? 'Invalid Image' : 'Error Processing Receipt',
        error.message,
        [
          { 
            text: 'Try Again',
            onPress: () => {
              clearError();
              setIsModalVisible(true);
            }
          },
          {
            text: 'Help',
            onPress: () => {
              Alert.alert(
                'How to Take a Good Receipt Photo',
                '• Place the receipt on a flat, well-lit surface\n' +
                '• Make sure the entire receipt is visible\n' +
                '• Avoid shadows and glare\n' +
                '• Hold the camera steady to avoid blur\n' +
                '• Take a photo of the actual receipt, not a screenshot\n' +
                '• Ensure prices are clearly visible\n' +
                '• Avoid crumpled or damaged receipts'
              );
            }
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: clearError
          }
        ]
      );
    }
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedReceipts(new Set());
  };

  const toggleSelectAll = () => {
    if (selectedReceipts.size === receipts.length) {
      // If all are selected, unselect all
      setSelectedReceipts(new Set());
    } else {
      // Select all
      setSelectedReceipts(new Set(receipts.map(receipt => receipt.id)));
    }
  };

  const toggleReceiptSelection = (receiptId) => {
    const newSelected = new Set(selectedReceipts);
    if (newSelected.has(receiptId)) {
      newSelected.delete(receiptId);
    } else {
      newSelected.add(receiptId);
    }
    setSelectedReceipts(newSelected);
  };

  const deleteSelectedReceipts = async () => {
    if (selectedReceipts.size === 0) return;

    Alert.alert(
      'Delete Selected Receipts',
      `Are you sure you want to delete ${selectedReceipts.size} receipt(s)?`,
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
              setLoading(true);
              const selectedReceiptsList = receipts.filter(receipt => selectedReceipts.has(receipt.id));
              
              // Delete each receipt
              for (const receipt of selectedReceiptsList) {
                // Delete local file if it exists
                if (receipt.uri) {
                  try {
                    await FileSystem.deleteAsync(receipt.uri, { idempotent: true });
                  } catch (err) {
                    console.log('Local file deletion error:', err);
                  }
                }
              }
              
              // Update local state
              setReceipts(prevReceipts => 
                prevReceipts.filter(receipt => !selectedReceipts.has(receipt.id))
              );
              
              setSelectedReceipts(new Set());
              setIsSelectionMode(false);
              Alert.alert('Success', 'Selected receipts deleted successfully');
            } catch (error) {
              handleError(error, 'deleting selected receipts');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 2000); // Hide after 2 seconds
  };

  const handleReceiptUpload = async (receiptData) => {
    try {
      setLoading(true);
      // Check if receipt is valid (has items)
      if (receiptData.items && receiptData.items.length > 0) {
        // Add receipt to state
        setReceipts(prevReceipts => [...prevReceipts, receiptData]);
        handleSuccess();
      }
      // If invalid, just silently ignore
    } finally {
      setLoading(false);
    }
  };

  const renderReceipt = ({ item }) => {
    const date = new Date(item.timestamp);
    const formattedTime = date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: 'numeric',
      hour12: true 
    });

    // Format the URI based on whether it's a local or server image
    const imageUri = item.type === 'server' 
      ? `${SERVER_URL}/images/${item.id}.jpg`
      : item.uri;

    console.log('Rendering receipt with URI:', imageUri); // Debug log

    return (
      <View style={styles.cardContainer}>
        <TouchableOpacity 
          style={[
            styles.receiptCard,
            selectedReceipts.has(item.id) && styles.selectedReceipt,
          ]}
          onPress={() => {
            if (isSelectionMode) {
              toggleReceiptSelection(item.id);
            } else {
              // TODO: Add full screen view of receipt
              console.log('View receipt:', imageUri);
            }
          }}
          onLongPress={() => {
            if (!isSelectionMode) {
              setIsSelectionMode(true);
              toggleReceiptSelection(item.id);
            }
          }}
        >
          {item.uri ? (
            <>
              <Image 
                source={{ uri: imageUri }} 
                style={styles.receiptImage}
                resizeMode="cover"
                onError={(error) => console.error('Image loading error:', error.nativeEvent.error)}
              />
              <View style={styles.receiptContent}>
                <View style={styles.receiptHeader}>
                  <Text style={styles.storeName} numberOfLines={1}>
                    {item.storeName || 'Receipt'}
                  </Text>
                  {item.items && (
                    <View style={styles.itemCountContainer}>
                      <MaterialIcons name="receipt" size={12} color={COLORS.primary} />
                      <Text style={styles.itemCount}>
                        {item.items.length} items
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.cardFooter}>
                  <View style={styles.dateContainer}>
                    <MaterialIcons 
                      name={item.type === 'camera' ? 'camera-alt' : 'photo-library'} 
                      size={16} 
                      color={COLORS.primary} 
                    />
                    <Text style={styles.dateText}>{formattedTime}</Text>
                  </View>
                  {!isSelectionMode && (
                    <TouchableOpacity 
                      style={styles.deleteButton}
                      onPress={() => deleteReceipt(item)}
                    >
                      <MaterialIcons name="delete-outline" size={20} color={COLORS.error} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </>
          ) : (
            <View style={styles.uploadContainer}>
              <MaterialIcons name="add-photo-alternate" size={32} color={COLORS.primary} />
              <TouchableOpacity 
                style={styles.uploadButton}
                onPress={() => setIsModalVisible(true)}
              >
                <Text style={styles.uploadButtonText}>Upload New Receipt</Text>
              </TouchableOpacity>
            </View>
          )}

          {isSelectionMode && (
            <View style={styles.checkboxContainer}>
              <MaterialIcons 
                name={selectedReceipts.has(item.id) ? "check-circle" : "radio-button-unchecked"} 
                size={28} 
                color={selectedReceipts.has(item.id) ? COLORS.primary : '#fff'} 
              />
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <CustomStatusBar />
      <View style={styles.statusBarBackground} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={toggleSelectAll}
            >
              <MaterialIcons name="select-all" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Your Receipts</Text>
            <View style={styles.headerRightButtons}>
              <TouchableOpacity
                style={[styles.headerButton, styles.headerButtonMargin]}
                onPress={deleteSelectedReceipts}
              >
                <MaterialIcons name="delete" size={24} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => setIsModalVisible(true)}
              >
                <MaterialIcons name="add" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.contentContainer}>
          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : receipts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="receipt-long" size={48} color={COLORS.primary} />
              <Text style={styles.emptyTitle}>No receipts yet</Text>
              <Text style={styles.emptySubtitle}>
                Add your first receipt by tapping the + button
              </Text>
              <TouchableOpacity 
                style={styles.addFirstButton}
                onPress={() => setIsModalVisible(true)}
              >
                <MaterialIcons name="add" size={24} color={COLORS.white} />
                <Text style={styles.addFirstButtonText}>Add Receipt</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={receipts}
              renderItem={renderReceipt}
              keyExtractor={item => item.id}
              numColumns={COLUMN_COUNT}
              contentContainerStyle={styles.receiptsList}
              showsVerticalScrollIndicator={false}
              columnWrapperStyle={styles.row}
              refreshControl={
                <RefreshControl
                  refreshing={loading}
                  onRefresh={loadExistingReceipts}
                  colors={[COLORS.primary]}
                />
              }
            />
          )}
        </View>

        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Receipt</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setIsModalVisible(false)}
                >
                  <MaterialIcons name="close" size={24} color={COLORS.gray} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalOptions}>
                <TouchableOpacity 
                  style={styles.modalOption} 
                  onPress={takePhoto}
                >
                  <View style={styles.iconContainer}>
                    <MaterialIcons name="camera-alt" size={24} color={COLORS.white} />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>Take Photo</Text>
                    <Text style={styles.optionDescription}>Capture a new receipt</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color={COLORS.gray} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.modalOption} 
                  onPress={pickImage}
                >
                  <View style={styles.iconContainer}>
                    <MaterialIcons name="photo-library" size={24} color={COLORS.white} />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>Choose from Gallery</Text>
                    <Text style={styles.optionDescription}>Select an existing photo</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color={COLORS.gray} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  headerRightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
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
  headerButtonMargin: {
    marginRight: SIZES.base,
  },
  headerTitle: {
    fontSize: SIZES.large,
    fontFamily: FONTS.medium,
    color: COLORS.black,
  },
  contentContainer: {
    flex: 1,
    paddingTop: SIZES.padding,
  },
  title: {
    fontSize: SIZES.fontSize.title,
    fontFamily: FONTS.medium,
    color: COLORS.black,
    marginBottom: SIZES.padding,
    paddingHorizontal: SIZES.padding,
  },
  row: {
    justifyContent: 'flex-start',
    gap: CARD_MARGIN * 2,
  },
  cardContainer: {
    width: CARD_WIDTH,
    marginBottom: 16,
  },
  receiptCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  receiptImage: {
    width: '100%',
    height: CARD_WIDTH * 1.2,
    backgroundColor: COLORS.lightGray,
  },
  receiptContent: {
    padding: 12,
  },
  receiptHeader: {
    marginBottom: 8,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  itemCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemCount: {
    fontSize: 12,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  uploadContainer: {
    height: CARD_WIDTH * 1.2,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 12,
  },
  uploadButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
  },
  uploadButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  checkboxContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 14,
    padding: 2,
  },
  selectedReceipt: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  successBanner: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: COLORS.success,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    elevation: 5,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  successText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
  },
  emptyTitle: {
    fontSize: SIZES.fontSize.title,
    fontFamily: FONTS.medium,
    color: COLORS.black,
    marginTop: SIZES.padding,
    marginBottom: SIZES.base,
  },
  emptySubtitle: {
    fontSize: SIZES.fontSize.subtitle,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: SIZES.padding * 2,
  },
  addFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    borderRadius: SIZES.radius,
    gap: SIZES.base,
  },
  addFirstButtonText: {
    fontSize: SIZES.fontSize.subtitle,
    fontFamily: FONTS.medium,
    color: COLORS.white,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SIZES.radius * 2,
    borderTopRightRadius: SIZES.radius * 2,
    paddingTop: SIZES.padding,
    paddingBottom: Platform.OS === 'ios' ? 34 : SIZES.padding,
    ...SHADOWS.medium,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalTitle: {
    fontSize: SIZES.large,
    fontFamily: FONTS.medium,
    color: COLORS.black,
  },
  closeButton: {
    padding: SIZES.base,
  },
  modalOptions: {
    paddingTop: SIZES.padding,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.padding,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: SIZES.font,
    fontFamily: FONTS.medium,
    color: COLORS.black,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: SIZES.small,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
  },
  deleteButton: {
    padding: SIZES.xs,
  },
  selectionText: {
    fontSize: 16,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  logo: {
    height: 32,
    width: 100,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  receiptsList: {
    padding: SIZES.padding,
  },
});

export default BillsScreen; 