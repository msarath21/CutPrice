export const COLORS = {
    primary: '#462009',  // Brown color for the app theme
    secondary: '#CD853F',
    statusBar: '#462009',  // Dark brown for status bar
    white: '#FFFFFF',
    black: '#462009',
    gray: '#808080',
    lightGray: '#E5E5E5',
    background: '#FFFFFF',
    error: '#DC2626',
    success: '#059669',
};

export const SIZES = {
    base: 8,
    small: 12,
    padding: 16,
    radius: 8,
    extraLarge: 32,

    fontSize: {
        small: 12,
        body: 14,
        subtitle: 16,
        title: 20,
        large: 24,
        extraLarge: 32,
    },
};

export const FONTS = {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
};

export const SHADOWS = {
    light: {
        shadowColor: COLORS.gray,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
    },
    medium: {
        shadowColor: COLORS.gray,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    dark: {
        shadowColor: COLORS.gray,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    },
}; 