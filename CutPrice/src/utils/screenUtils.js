import React from 'react';
import { View, StyleSheet, Platform, StatusBar } from 'react-native';
import { COLORS } from '../constants/theme';
import CustomStatusBar from '../components/StatusBar';

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight : 0;

export const withBrownStatusBar = (WrappedComponent) => {
    return (props) => (
        <View style={styles.container}>
            <CustomStatusBar />
            <View style={styles.statusBarBackground} />
            <WrappedComponent {...props} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    statusBarBackground: {
        height: STATUSBAR_HEIGHT,
        backgroundColor: COLORS.primary,
    },
}); 