import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { StatusBar } from 'expo-status-bar';
import { User, LogOut, Settings, CreditCard, Shield, HelpCircle, ChevronRight } from 'lucide-react-native';

export default function ProfileScreen() {
    const { user, signOut } = useAuthStore();
    const userName = user?.user_metadata?.full_name || 'Wassel User';
    const userEmail = user?.email || '';

    const handleSignOut = async () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await signOut();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to sign out');
                        }
                    }
                }
            ]
        );
    };

    const MenuItem = ({ icon: Icon, title, onPress, danger = false }: any) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={styles.menuIconContainer}>
                <Icon size={20} color={danger ? '#ef4444' : '#6b7280'} />
            </View>
            <Text style={[styles.menuText, danger && styles.dangerText]}>{title}</Text>
            <ChevronRight size={20} color="#d1d5db" />
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            <StatusBar style="dark" />

            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>{userName.charAt(0)}</Text>
                </View>
                <Text style={styles.name}>{userName}</Text>
                <Text style={styles.email}>{userEmail}</Text>
                <TouchableOpacity style={styles.editButton} onPress={() => router.push('/profile/edit')}>
                    <Text style={styles.editButtonText}>Edit Profile</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account</Text>
                <View style={styles.menuContainer}>
                    <MenuItem icon={User} title="Personal Information" onPress={() => { }} />
                    <MenuItem icon={CreditCard} title="Payments & Wallet" onPress={() => { }} />
                    <MenuItem icon={Settings} title="Preferences" onPress={() => { }} />
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Support</Text>
                <View style={styles.menuContainer}>
                    <MenuItem icon={Shield} title="Safety Center" onPress={() => { }} />
                    <MenuItem icon={HelpCircle} title="Help & Support" onPress={() => { }} />
                </View>
            </View>

            <View style={styles.section}>
                <View style={styles.menuContainer}>
                    <MenuItem icon={LogOut} title="Sign Out" onPress={handleSignOut} danger />
                </View>
            </View>

            <Text style={styles.version}>Version 1.0.0</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    header: {
        alignItems: 'center',
        padding: 32,
        paddingTop: 60,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#3b82f6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: 'white',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 16,
    },
    editButton: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
    },
    editButtonText: {
        color: '#4b5563',
        fontWeight: '600',
        fontSize: 14,
    },
    section: {
        marginTop: 24,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280',
        marginBottom: 8,
        marginLeft: 4,
        textTransform: 'uppercase',
    },
    menuContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    menuIconContainer: {
        width: 32,
        alignItems: 'flex-start',
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        color: '#374151',
    },
    dangerText: {
        color: '#ef4444',
    },
    version: {
        textAlign: 'center',
        color: '#9ca3af',
        fontSize: 12,
        marginTop: 32,
        marginBottom: 20,
    },
});
