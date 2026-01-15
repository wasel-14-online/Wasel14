import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Share } from 'react-native';
import { Phone, MessageCircle, AlertTriangle, Navigation, Clock, MapPin, Share2, X, Shield } from 'lucide-react-native';

interface LiveTripProps {
    tripId: string;
    driverId: string;
    driverInfo: {
        name: string;
        photo?: string;
        rating: number;
        vehicleModel: string;
        vehiclePlate: string;
        vehicleColor: string;
    };
    pickupLocation: {
        address: string;
        coordinates: { lat: number; lng: number };
    };
    dropoffLocation: {
        address: string;
        coordinates: { lat: number; lng: number };
    };
    onCancel?: () => void;
    onComplete?: () => void;
}

export function LiveTrip({
    tripId,
    driverInfo,
    pickupLocation,
    dropoffLocation,
    onCancel,
    onComplete,
}: LiveTripProps) {
    const [verificationCode] = useState(() => Math.floor(1000 + Math.random() * 9000).toString());
    const [tripStatus] = useState('arriving'); // Mock status

    const handleCall = () => {
        Alert.alert('Call', 'Initiating call to driver...');
    };

    const handleMessage = () => {
        Alert.alert('Message', 'Opening chat with driver...');
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Track my trip on Wassel. Verification code: ${verificationCode}`,
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to share trip');
        }
    };

    const handleEmergencySOS = () => {
        Alert.alert(
            'Emergency SOS',
            'Are you sure you want to send an emergency alert?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Send SOS', style: 'destructive', onPress: () => Alert.alert('SOS Sent', 'Emergency alert sent! Help is on the way.') },
            ]
        );
    };

    const getStatusText = () => {
        switch (tripStatus) {
            case 'waiting':
                return 'Driver is on the way';
            case 'arriving':
                return 'Driver is arriving';
            case 'picked_up':
                return 'Picked up - heading to destination';
            case 'in_progress':
                return 'Trip in progress';
            case 'completed':
                return 'Trip completed';
            default:
                return 'Connecting...';
        }
    };

    const getStatusColor = () => {
        switch (tripStatus) {
            case 'waiting':
            case 'arriving':
                return '#fbbf24';
            case 'picked_up':
            case 'in_progress':
                return '#10b981';
            case 'completed':
                return '#3b82f6';
            default:
                return '#6b7280';
        }
    };

    const formatETA = () => '5 mins away'; // Mock
    const formatDistance = () => '2.3 km'; // Mock

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
            <View style={{ padding: 16 }}>
                {/* Status Bar */}
                <View style={{
                    backgroundColor: 'white',
                    padding: 16,
                    borderRadius: 8,
                    marginBottom: 16,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3
                }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{
                                width: 12,
                                height: 12,
                                borderRadius: 6,
                                backgroundColor: getStatusColor(),
                                marginRight: 12
                            }} />
                            <View>
                                <Text style={{ fontSize: 16, fontWeight: '600' }}>{getStatusText()}</Text>
                                <Text style={{ fontSize: 12, color: '#6b7280' }}>Trip ID: {tripId.slice(0, 8)}</Text>
                            </View>
                        </View>
                        <View style={{
                            backgroundColor: '#1f2937',
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            borderRadius: 8
                        }}>
                            <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>{verificationCode}</Text>
                        </View>
                    </View>

                    {/* ETA Progress */}
                    <View style={{ marginBottom: 8 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Clock size={14} color="#6b7280" />
                                <Text style={{ fontSize: 12, marginLeft: 4 }}>{formatETA()}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Navigation size={14} color="#6b7280" />
                                <Text style={{ fontSize: 12, marginLeft: 4 }}>{formatDistance()}</Text>
                            </View>
                        </View>
                        <View style={{
                            height: 4,
                            backgroundColor: '#e5e7eb',
                            borderRadius: 2,
                            overflow: 'hidden'
                        }}>
                            <View style={{
                                width: '70%', // Mock progress
                                height: '100%',
                                backgroundColor: '#3b82f6'
                            }} />
                        </View>
                    </View>
                </View>

                {/* Map View */}
                <View style={{
                    backgroundColor: 'white',
                    height: 300,
                    borderRadius: 8,
                    marginBottom: 16,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative'
                }}>
                    <MapPin size={48} color="#6b7280" />
                    <Text style={{ marginTop: 8, color: '#6b7280' }}>Map view</Text>
                    <Text style={{ fontSize: 12, color: '#6b7280' }}>Integrate react-native-maps</Text>

                    {/* SOS Button */}
                    <TouchableOpacity
                        style={{
                            position: 'absolute',
                            bottom: 16,
                            right: 16,
                            backgroundColor: '#ef4444',
                            padding: 12,
                            borderRadius: 50,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.3,
                            shadowRadius: 4,
                            elevation: 5
                        }}
                        onPress={handleEmergencySOS}
                    >
                        <Shield size={20} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Driver Info */}
                <View style={{
                    backgroundColor: 'white',
                    padding: 16,
                    borderRadius: 8,
                    marginBottom: 16,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3
                }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Your Driver</Text>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                            <View style={{
                                width: 64,
                                height: 64,
                                borderRadius: 32,
                                backgroundColor: '#e5e7eb',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginRight: 12
                            }}>
                                <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{driverInfo.name.charAt(0)}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 18, fontWeight: '600' }}>{driverInfo.name}</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                    <Text style={{ fontSize: 14, color: '#6b7280' }}>⭐ {driverInfo.rating.toFixed(1)}</Text>
                                    <Text style={{ fontSize: 14, color: '#6b7280', marginHorizontal: 8 }}>•</Text>
                                    <Text style={{ fontSize: 14, color: '#6b7280' }}>{driverInfo.vehicleModel}</Text>
                                </View>
                                <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                                    {driverInfo.vehicleColor} • {driverInfo.vehiclePlate}
                                </Text>
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 20,
                                    backgroundColor: '#e5e7eb',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginRight: 8
                                }}
                                onPress={handleCall}
                            >
                                <Phone size={16} color="#374151" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 20,
                                    backgroundColor: '#e5e7eb',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                                onPress={handleMessage}
                            >
                                <MessageCircle size={16} color="#374151" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Trip Details */}
                <View style={{
                    backgroundColor: 'white',
                    padding: 16,
                    borderRadius: 8,
                    marginBottom: 16,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3
                }}>
                    <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                        <View style={{ alignItems: 'center', marginRight: 12 }}>
                            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981' }} />
                            <View style={{ width: 1, height: 32, backgroundColor: '#d1d5db' }} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 12, color: '#6b7280' }}>Pickup</Text>
                            <Text style={{ fontSize: 16, fontWeight: '600' }}>{pickupLocation.address}</Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ alignItems: 'center', marginRight: 12 }}>
                            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444' }} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 12, color: '#6b7280' }}>Dropoff</Text>
                            <Text style={{ fontSize: 16, fontWeight: '600' }}>{dropoffLocation.address}</Text>
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                    <TouchableOpacity
                        style={{
                            flex: 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#e5e7eb',
                            paddingVertical: 12,
                            borderRadius: 8,
                            marginRight: 8
                        }}
                        onPress={handleShare}
                    >
                        <Share2 size={16} color="#374151" />
                        <Text style={{ marginLeft: 8, fontWeight: '600' }}>Share Trip</Text>
                    </TouchableOpacity>

                    {tripStatus === 'waiting' && onCancel && (
                        <TouchableOpacity
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#ef4444',
                                paddingVertical: 12,
                                paddingHorizontal: 16,
                                borderRadius: 8
                            }}
                            onPress={onCancel}
                        >
                            <X size={16} color="white" />
                            <Text style={{ marginLeft: 8, color: 'white', fontWeight: '600' }}>Cancel Trip</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Safety Info */}
                <View style={{
                    backgroundColor: '#eff6ff',
                    padding: 16,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: '#bfdbfe'
                }}>
                    <View style={{ flexDirection: 'row' }}>
                        <Shield size={20} color="#2563eb" style={{ marginRight: 12, marginTop: 2 }} />
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 16, fontWeight: '600', color: '#1e40af', marginBottom: 8 }}>
                                Your safety is our priority
                            </Text>
                            <Text style={{ fontSize: 14, color: '#3730a3', lineHeight: 20, marginBottom: 4 }}>
                                • Share your trip with trusted contacts
                            </Text>
                            <Text style={{ fontSize: 14, color: '#3730a3', lineHeight: 20, marginBottom: 4 }}>
                                • Verify driver details before entering vehicle
                            </Text>
                            <Text style={{ fontSize: 14, color: '#3730a3', lineHeight: 20, marginBottom: 4 }}>
                                • Use SOS button in case of emergency
                            </Text>
                            <Text style={{ fontSize: 14, color: '#3730a3', lineHeight: 20 }}>
                                • All trips are tracked and recorded
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}