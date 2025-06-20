import { Platform } from 'react-native';

// Server configuration
export const SERVER_URL = 'http://10.0.0.169:3001'; // Development server IP

// Get the appropriate server URL based on the environment
export const getServerUrl = () => {
  if (__DEV__) {
    // Use the local network IP for both Android and iOS
    return 'http://10.0.0.169:3001';
  }
  // For production, use your actual server URL
  return 'https://your-production-server.com';
}; 