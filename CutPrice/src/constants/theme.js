export const COLORS = {
    primary: '#462009',  // Main brown color
    primaryLight: '#693010', // Lighter brown for hover/active states
    primaryDark: '#2E1506', // Darker brown for text on light backgrounds
    secondary: '#663300',
    error: '#FF0000',
    success: '#4CAF50',
    gray: '#757575',
    lightGray: '#EFEFEF',
    white: '#FFFFFF',
    black: '#000000',
    overlay: 'rgba(70, 32, 9, 0.5)', // Brown overlay
    inputBackground: '#F8F8F8',
    inputBorder: '#E8E8E8',
    background: '#F8F8F8',
    card: '#FFFFFF',
    text: {
        primary: '#462009',
        secondary: '#693010',
        gray: '#757575',
        light: '#FFFFFF'
    },
    border: {
        light: '#E8E8E8',
        dark: '#462009'
    }
};

export const SIZES = {
    base: 8,
    small: 12,
    font: 14,
    medium: 16,
    large: 18,
    extraLarge: 24,
    padding: 16,
    radius: 12,
    fontSize: {
        title: 24,
        subtitle: 16,
        body: 14,
        caption: 12,
    }
};

export const FONTS = {
    regular: 'System',
    medium: 'System',
    bold: 'System',
};

export const SHADOWS = {
    light: {
        shadowColor: COLORS.black,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
    },
    medium: {
        shadowColor: COLORS.black,
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.29,
        shadowRadius: 4.65,
        elevation: 7,
    },
}; 