import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { messagesAPI } from '../../src/services/api';
import { useAuthStore } from '../../src/stores/authStore';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function MessagesList() {
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        try {
            const { conversations } = await messagesAPI.getConversations();
            setConversations(conversations);
        } catch (error) {
            console.error('Failed to load conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => router.push(`/messages/${item.other_user?.id}`)}
        >
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.other_user?.full_name?.charAt(0)}</Text>
            </View>
            <View style={styles.contentContainer}>
                <View style={styles.topRow}>
                    <Text style={styles.name}>{item.other_user?.full_name}</Text>
                    <Text style={styles.time}>
                        {new Date(item.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
                <View style={styles.bottomRow}>
                    <Text style={[styles.message, item.unread_count > 0 && styles.unreadMessage]} numberOfLines={1}>
                        {item.last_message.content}
                    </Text>
                    {item.unread_count > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{item.unread_count}</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <Text style={styles.headerTitle}>Messages</Text>
            {conversations.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No messages yet</Text>
                </View>
            ) : (
                <FlatList
                    data={conversations}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 60,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        paddingHorizontal: 20,
        marginBottom: 20,
        color: '#1f2937',
    },
    list: {
        paddingHorizontal: 20,
    },
    itemContainer: {
        flexDirection: 'row',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#e5e7eb',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#6b7280',
    },
    contentContainer: {
        flex: 1,
        marginLeft: 16,
        justifyContent: 'center',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    time: {
        fontSize: 12,
        color: '#9ca3af',
    },
    message: {
        fontSize: 14,
        color: '#6b7280',
        flex: 1,
        marginRight: 8,
    },
    unreadMessage: {
        color: '#1f2937',
        fontWeight: '600',
    },
    badge: {
        backgroundColor: '#3b82f6',
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: '#9ca3af',
        fontSize: 16,
    },
});
