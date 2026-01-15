import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { paymentService } from '../services';


interface PaymentButtonProps {
    amount: number;
    currency?: string;
    description?: string;
    onPaymentSuccess?: (transactionId: string) => void;
    onPaymentError?: (error: string) => void;
    disabled?: boolean;
    style?: any;
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({
    amount,
    currency = 'USD',
    description = 'Ride Payment',
    onPaymentSuccess,
    onPaymentError,
    disabled = false,
    style,
}) => {
    const [isAvailable, setIsAvailable] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const checkAvailability = async () => {
            const available = await paymentService.isNativePaymentAvailable();
            setIsAvailable(available);
        };

        checkAvailability();
    }, []);

    const handlePayment = async () => {
        if (disabled || loading) return;

        setLoading(true);

        try {
            const result = await paymentService.processPayment(amount, currency, description);

            if (result.success && result.transactionId) {
                onPaymentSuccess?.(result.transactionId);
                Alert.alert('Payment Successful', `Transaction ID: ${result.transactionId}`);
            } else {
                const errorMessage = result.error || 'Payment failed';
                onPaymentError?.(errorMessage);
                Alert.alert('Payment Failed', errorMessage);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
            onPaymentError?.(errorMessage);
            Alert.alert('Payment Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (!isAvailable) {
        return null; // Don't show the button if native payment is not available
    }

    return (
        <TouchableOpacity
            style={[styles.button, disabled && styles.buttonDisabled, style]}
            onPress={handlePayment}
            disabled={disabled || loading}
        >
            {loading ? (
                <ActivityIndicator color="#fff" size="small" />
            ) : (
                <Text style={styles.buttonText}>
                    Pay {paymentService.formatAmount(amount, currency)}
                </Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#000',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 50,
    },
    buttonDisabled: {
        backgroundColor: '#666',
        opacity: 0.6,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});