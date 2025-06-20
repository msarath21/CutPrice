import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../constants/theme';

const FilterModal = ({ visible, onClose, activeFilters, onFilterChange, categoryId }) => {
    const filters = {
        sort: [
            { id: 'price-low-high', label: 'Price: Low to High', icon: 'arrow-upward' },
            { id: 'price-high-low', label: 'Price: High to Low', icon: 'arrow-downward' },
            { id: 'rating-high-low', label: 'Highest Rated', icon: 'star' },
        ],
        other: [
            { id: 'rating-4.5', label: 'Rating 4.5+', icon: 'grade' },
            { id: 'in-stock', label: 'In Stock', icon: 'inventory' },
        ],
        // Category-specific filters
        '1': [{ id: 'organic', label: 'Organic Only', icon: 'eco' }], // Fruits & Vegetables
        '2': [{ id: 'organic', label: 'Organic Only', icon: 'eco' }], // Dairy & Eggs
        '3': [{ id: 'sugar-free', label: 'Sugar Free', icon: 'health-and-safety' }], // Beverages
        '4': [{ id: 'gluten-free', label: 'Gluten Free', icon: 'health-and-safety' }], // Snacks
    };

    const renderFilterSection = (title, filterItems) => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {filterItems.map((filter) => (
                <TouchableOpacity
                    key={filter.id}
                    style={[
                        styles.filterItem,
                        activeFilters.includes(filter.id) && styles.filterItemActive,
                    ]}
                    onPress={() => onFilterChange(filter.id)}
                >
                    <MaterialIcons
                        name={filter.icon}
                        size={24}
                        color={activeFilters.includes(filter.id) ? COLORS.white : COLORS.primary}
                    />
                    <Text
                        style={[
                            styles.filterText,
                            activeFilters.includes(filter.id) && styles.filterTextActive,
                        ]}
                    >
                        {filter.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Filter Products</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <MaterialIcons name="close" size={24} color={COLORS.primary} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.filtersContainer}>
                        {renderFilterSection('Sort By', filters.sort)}
                        {renderFilterSection('Filters', filters.other)}
                        {filters[categoryId] && renderFilterSection('Category Filters', filters[categoryId])}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: SIZES.padding,
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        width: '100%',
        maxWidth: 400,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SIZES.padding,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    headerTitle: {
        fontSize: SIZES.fontSize.title,
        fontWeight: FONTS.bold,
        color: COLORS.primary,
    },
    closeButton: {
        padding: 5,
    },
    filtersContainer: {
        padding: SIZES.padding,
    },
    section: {
        marginBottom: SIZES.padding * 1.5,
    },
    sectionTitle: {
        fontSize: SIZES.fontSize.subtitle,
        fontWeight: FONTS.bold,
        color: COLORS.gray,
        marginBottom: SIZES.padding,
    },
    filterItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SIZES.padding,
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
    },
    filterItemActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    filterText: {
        fontSize: SIZES.fontSize.body,
        color: COLORS.primary,
        marginLeft: 10,
    },
    filterTextActive: {
        color: COLORS.white,
    },
    title: {
        fontSize: SIZES.fontSize.title,
        fontFamily: FONTS.medium,
        color: COLORS.black,
        textAlign: 'center',
        marginBottom: SIZES.base,
    },
    subtitle: {
        fontSize: SIZES.fontSize.subtitle,
        fontFamily: FONTS.regular,
        color: COLORS.gray,
        textAlign: 'center',
        marginBottom: SIZES.padding,
    },
});

export default FilterModal; 