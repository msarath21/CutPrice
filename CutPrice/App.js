import React, { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { setupStoreFiles } from './src/utils/setupFiles';

export default function App() {
  useEffect(() => {
    setupStoreFiles();
  }, []);

  return <AppNavigator />;
} 