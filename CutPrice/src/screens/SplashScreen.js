import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import * as FileSystem from 'expo-file-system';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if receipts directory exists
        const dirInfo = await FileSystem.getInfoAsync(`${FileSystem.documentDirectory}receipts`);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}receipts`, { intermediates: true });
        }

        // Navigate to GetStarted screen after initialization
        setTimeout(() => {
          navigation.replace('GetStarted');
        }, 1000);
      } catch (error) {
        console.error('Initialization error:', error);
        navigation.replace('GetStarted');
      }
    };

    initializeApp();
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/header.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    width: '80%',
    height: 100,
  },
}); 