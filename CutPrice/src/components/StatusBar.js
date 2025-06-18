import React from 'react';
import { StatusBar } from 'react-native';
import { COLORS } from '../constants/theme';

const CustomStatusBar = () => {
    return (
        <StatusBar
            backgroundColor={COLORS.primary}
            barStyle="light-content"
        />
    );
};

export default CustomStatusBar; 