import React from 'react';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { View, Platform, StatusBar as RNStatusBar } from 'react-native';
import { COLORS } from '../constants/theme';

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? RNStatusBar.currentHeight : 0;

export default function StatusBar() {
    if (Platform.OS === 'ios') {
        return <ExpoStatusBar style="light" />;
    }

    return (
        <>
            <View
                style={{
                    height: STATUSBAR_HEIGHT,
                    backgroundColor: COLORS.statusBar,
                }}
            >
                <ExpoStatusBar style="light" />
            </View>
        </>
    );
} 