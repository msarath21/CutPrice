export const categories = [
    {
        id: '1',
        name: 'Fruits & Vegetables',
        icon: 'eco',
    },
    {
        id: '2',
        name: 'Dairy & Eggs',
        icon: 'egg',
    },
    {
        id: '3',
        name: 'Household',
        icon: 'cleaning-services',
    },
    {
        id: '4',
        name: 'Meat & Poultry',
        icon: 'restaurant',
    },
    {
        id: '5',
        name: 'Pantry',
        icon: 'kitchen',
    },
    {
        id: '6',
        name: 'Bills',
        icon: 'receipt',
    },
];

export const products = {
    '1': [ // Fruits & Vegetables
        {
            id: '1-1',
            name: 'Apples',
            prices: {
                'Walmart': 1.29,
                'Costco': 1.99,
                'Indian Store': 1.79
            },
            ratings: {
                'Walmart': 4.2,
                'Costco': 4.6,
                'Indian Store': 4.3
            },
            organic: {
                'Walmart': false,
                'Costco': true,
                'Indian Store': true
            },
            unit: 'lb',
            inStock: true
        },
        {
            id: '1-2',
            name: 'Bananas',
            prices: {
                'Walmart': 0.59,
                'Costco': 0.79,
                'Indian Store': 0.69
            },
            ratings: {
                'Walmart': 4.4,
                'Costco': 4.5,
                'Indian Store': 4.3
            },
            organic: {
                'Walmart': true,
                'Costco': true,
                'Indian Store': true
            },
            unit: 'lb',
            inStock: true
        },
    ],
    '2': [ // Dairy & Eggs
        {
            id: '2-1',
            name: 'Whole Milk',
            prices: {
                'Walmart': 3.49,
                'Costco': 4.29,
                'Indian Store': 3.89
            },
            ratings: {
                'Walmart': 4.5,
                'Costco': 4.7,
                'Indian Store': 4.4
            },
            organic: {
                'Walmart': false,
                'Costco': true,
                'Indian Store': false
            },
            unit: 'gallon',
            inStock: true
        },
    ],
    '3': [ // Household
        {
            id: '3-1',
            name: 'Toilet Paper',
            prices: {
                'Walmart': 6.49,
                'Costco': 8.99,
                'Indian Store': 7.49
            },
            ratings: {
                'Walmart': 4.3,
                'Costco': 4.8,
                'Indian Store': 4.0
            },
            organic: {
                'Walmart': false,
                'Costco': false,
                'Indian Store': false
            },
            unit: '12 rolls',
            inStock: true
        },
        {
            id: '3-2',
            name: 'Laundry Detergent',
            prices: {
                'Walmart': 5.99,
                'Costco': 7.49,
                'Indian Store': 6.79
            },
            ratings: {
                'Walmart': 4.1,
                'Costco': 4.4,
                'Indian Store': 4.1
            },
            organic: {
                'Walmart': false,
                'Costco': true,
                'Indian Store': false
            },
            unit: '50 oz',
            inStock: true
        },
    ],
    '4': [ // Meat & Poultry
        {
            id: '4-1',
            name: 'Chicken Breast',
            prices: {
                'Walmart': 3.99,
                'Costco': 4.49,
                'Indian Store': 4.29
            },
            ratings: {
                'Walmart': 4.0,
                'Costco': 4.5,
                'Indian Store': 4.2
            },
            organic: {
                'Walmart': false,
                'Costco': true,
                'Indian Store': true
            },
            unit: '1 lb',
            inStock: true
        },
        {
            id: '4-2',
            name: 'Ground Beef',
            prices: {
                'Walmart': 4.79,
                'Costco': 5.29,
                'Indian Store': 5.99
            },
            ratings: {
                'Walmart': 4.2,
                'Costco': 4.6,
                'Indian Store': 4.4
            },
            organic: {
                'Walmart': false,
                'Costco': true,
                'Indian Store': false
            },
            unit: '1 lb',
            inStock: true
        },
    ],
    '5': [ // Pantry
        {
            id: '5-1',
            name: 'White Bread',
            prices: {
                'Walmart': 2.19,
                'Costco': 3.49,
                'Indian Store': 2.79
            },
            ratings: {
                'Walmart': 3.8,
                'Costco': 4.1,
                'Indian Store': 3.9
            },
            organic: {
                'Walmart': false,
                'Costco': true,
                'Indian Store': false
            },
            unit: 'loaf',
            inStock: true
        },
        {
            id: '5-2',
            name: 'Pasta',
            prices: {
                'Walmart': 1.39,
                'Costco': 1.79,
                'Indian Store': 1.59
            },
            ratings: {
                'Walmart': 4.0,
                'Costco': 4.2,
                'Indian Store': 4.0
            },
            organic: {
                'Walmart': false,
                'Costco': true,
                'Indian Store': false
            },
            unit: '1 lb',
            inStock: true
        },
        {
            id: '5-3',
            name: 'Canned Tomatoes',
            prices: {
                'Walmart': 1.09,
                'Costco': 1.39,
                'Indian Store': 1.29
            },
            ratings: {
                'Walmart': 3.9,
                'Costco': 4.0,
                'Indian Store': 3.8
            },
            organic: {
                'Walmart': false,
                'Costco': true,
                'Indian Store': true
            },
            unit: '14.5 oz',
            inStock: true
        },
    ],
}; 