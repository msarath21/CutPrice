import { AppRegistry } from 'react-native';
import { registerRootComponent } from 'expo';
import App from './App';

// Ensure both registration methods are used for maximum compatibility
AppRegistry.registerComponent('main', () => App);
registerRootComponent(App);
