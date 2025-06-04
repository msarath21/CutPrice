# CutPrice App

A React Native/Expo mobile app for comparing prices and managing shopping bills.

## Prerequisites

- Node.js (v18 or newer)
- Expo CLI: `npm install -g expo-cli`
- Git
- VS Code (recommended) or any preferred code editor
- Expo Go app on your mobile device

## Getting Started

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd CutPrice
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npx expo start
   ```

4. Run the app:
   - Scan the QR code with Expo Go (Android) or Camera app (iOS)
   - Press 'a' for Android emulator
   - Press 'i' for iOS simulator

## Project Structure

```
CutPrice/
├── assets/
│   ├── header.png
│   └── stores/
├── src/
│   ├── screens/
│   │   ├── HomeScreen.js
│   │   ├── SignInScreen.js
│   │   ├── SignUpScreen.js
│   │   └── BillsScreen.js
│   ├── components/
│   ├── constants/
│   │   └── theme.js
│   └── utils/
└── App.js
```

## Features

- User authentication (Sign In/Sign Up)
- Home screen with category navigation
- Bills/Receipts management
- Receipt capture via camera or gallery
- Price comparison across stores

## Contributing

1. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit:
   ```bash
   git add .
   git commit -m "Add your commit message"
   ```

3. Push to your branch:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Create a Pull Request on GitHub

## Dependencies

- expo: ~50.0.5
- react: 18.2.0
- react-native: 0.73.2
- @react-navigation/native: ^6.1.9
- @react-navigation/native-stack: ^6.9.17
- expo-file-system: ~16.0.5
- expo-status-bar: ~1.11.1

## Development Notes

- The app uses Expo managed workflow
- Images are stored locally using expo-file-system
- Navigation is handled by React Navigation v6 