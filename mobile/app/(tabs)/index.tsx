import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useAuthStore } from '../src/stores/authStore';
import { FindRide } from '../src/components/FindRide';
import { OfferRide } from '../src/components/OfferRide';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function Home() {
    const { user } = useAuthStore();
    const userName = user?.user_metadata?.full_name || 'Traveler';

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Hello, {userName} 👋</Text>
                    <Text style={styles.subtitle}>Where do you want to go today?</Text>
                </View>
                <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>{userName.charAt(0)}</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={[styles.card, styles.findCard]}
                    onPress={() => router.push('/(tabs)/search')}
                >
                    <Text style={styles.cardTitle}>Find a Ride</Text>
                    <Text style={styles.cardDesc}>Book a seat and travel comfortably</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.card, styles.offerCard]}
                    onPress={() => router.push('/(tabs)/offer')}
                >
                    <Text style={styles.cardTitle}>Offer a Ride</Text>
                    <Text style={styles.cardDesc}>Share your journey and save costs</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No recent trips</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
        padding: 20,
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    subtitle: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 4,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#3b82f6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 32,
    },
    card: {
        flex: 1,
        padding: 20,
        borderRadius: 16,
        height: 140,
        justifyContent: 'flex-end',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    findCard: {
        backgroundColor: '#3b82f6',
    },
    offerCard: {
        backgroundColor: '#10b981',
    },
    cardTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    cardDesc: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 12,
    },
    section: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 16,
    },
    emptyState: {
        backgroundColor: 'white',
        padding: 32,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderStyle: 'dashed',
    },
    emptyText: {
        color: '#9ca3af',
    },
});
