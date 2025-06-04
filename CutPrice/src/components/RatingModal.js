import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../constants/theme';

const RatingModal = ({ visible, onClose, onSubmit, productName }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    const handleSubmit = () => {
        if (rating === 0) {
            alert('Please select a rating');
            return;
        }
        onSubmit({ rating, comment });
        setRating(0);
        setComment('');
        onClose();
    };

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
                        <Text style={styles.headerTitle}>Rate Product</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <MaterialIcons name="close" size={24} color={COLORS.primary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.content}>
                        <Text style={styles.productName}>{productName}</Text>
                        
                        <View style={styles.starsContainer}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity
                                    key={star}
                                    onPress={() => setRating(star)}
                                >
                                    <MaterialIcons
                                        name={rating >= star ? 'star' : 'star-border'}
                                        size={40}
                                        color={COLORS.primary}
                                        style={styles.star}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.ratingText}>
                            {rating > 0 ? `You rated: ${rating} stars` : 'Select your rating'}
                        </Text>

                        <TextInput
                            style={styles.commentInput}
                            placeholder="Add a comment (optional)"
                            value={comment}
                            onChangeText={setComment}
                            multiline
                            maxLength={200}
                            placeholderTextColor={COLORS.gray}
                        />

                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                rating === 0 && styles.submitButtonDisabled
                            ]}
                            onPress={handleSubmit}
                        >
                            <Text style={styles.submitButtonText}>Submit Rating</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: SIZES.radius * 2,
        borderTopRightRadius: SIZES.radius * 2,
        paddingBottom: 20,
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
    content: {
        padding: SIZES.padding,
        alignItems: 'center',
    },
    productName: {
        fontSize: SIZES.fontSize.subtitle,
        color: COLORS.primary,
        fontWeight: FONTS.bold,
        marginBottom: SIZES.padding,
        textAlign: 'center',
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: SIZES.padding,
    },
    star: {
        marginHorizontal: 5,
    },
    ratingText: {
        fontSize: SIZES.fontSize.body,
        color: COLORS.gray,
        marginBottom: SIZES.padding * 2,
    },
    commentInput: {
        width: '100%',
        height: 100,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        marginBottom: SIZES.padding,
        textAlignVertical: 'top',
        color: COLORS.primary,
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        padding: SIZES.padding,
        borderRadius: SIZES.radius,
        width: '100%',
        alignItems: 'center',
    },
    submitButtonDisabled: {
        opacity: 0.5,
    },
    submitButtonText: {
        color: COLORS.white,
        fontSize: SIZES.fontSize.body,
        fontWeight: FONTS.bold,
    },
});

export default RatingModal; 