import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, FlatList, Alert } from 'react-native';
import { tripsAPI, MobileAPIError } from '../services';

interface Ride {
    id: string;
    from: string;
    to: string;
    departure_date: string;
    departure_time: string;
    available_seats: number;
    price_per_seat: number;
    driver?: {
        name: string;
        rating: number;
        trips: number;
    };
    type?: string;
}

export function FindRide() {
    const [searchFrom, setSearchFrom] = useState('');
    const [searchTo, setSearchTo] = useState('');
    const [searchDate, setSearchDate] = useState('');
    const [passengers, setPassengers] = useState('1');
    const [activeTab, setActiveTab] = useState('basic');
    const [loading, setLoading] = useState(false);

    const [rides, setRides] = useState<Ride[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async () => {
        if (!searchFrom.trim() || !searchTo.trim()) {
            Alert.alert('Error', 'Please enter both starting location and destination');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await tripsAPI.searchTrips(
                searchFrom.trim(),
                searchTo.trim(),
                searchDate.trim() || undefined,
                passengers ? parseInt(passengers) : undefined
            );

            // Transform the API response to match our Ride interface
            const transformedRides: Ride[] = result.trips.map((trip: any) => ({
                id: trip.id,
                from: trip.from,
                to: trip.to,
                departure_date: trip.departure_date,
                departure_time: trip.departure_time,
                available_seats: trip.available_seats,
                price_per_seat: trip.price_per_seat,
                driver: trip.driver ? {
                    name: trip.driver.full_name || 'Unknown Driver',
                    rating: trip.driver.rating || 0,
                    trips: trip.driver.trips_completed || 0
                } : undefined,
                type: trip.trip_type || 'wasel'
            }));

            setRides(transformedRides);
        } catch (err) {
            console.error('Search error:', err);
            const errorMessage = err instanceof MobileAPIError
                ? err.message
                : 'Failed to search rides. Please try again.';
            setError(errorMessage);
            Alert.alert('Search Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (ride: Ride) => {
        Alert.alert(
            'Ride Details',
            `From: ${ride.from}\nTo: ${ride.to}\nDate: ${ride.departure_date}\nTime: ${ride.departure_time}\nPrice: $${ride.price_per_seat}\nAvailable seats: ${ride.available_seats}\nDriver: ${ride.driver?.name || 'Unknown'}`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Book Ride', onPress: () => handleBookRide(ride) }
            ]
        );
    };

    const handleBookRide = async (ride: Ride) => {
        // TODO: Implement booking functionality
        // This would require user authentication and booking API integration
        Alert.alert('Booking', 'Booking functionality will be implemented with user authentication.');
    };

    const renderRideItem = ({ item }: { item: Ride }) => (
        <TouchableOpacity
            style={{
                backgroundColor: 'white',
                margin: 8,
                padding: 16,
                borderRadius: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3
            }}
            onPress={() => handleViewDetails(item)}
        >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#e5e7eb', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.driver?.name.charAt(0) || 'D'}</Text>
                        </View>
                        <View>
                            <Text style={{ fontSize: 16, fontWeight: '600' }}>{item.driver?.name || 'Unknown Driver'}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{ fontSize: 12, color: '#fbbf24', marginLeft: 4 }}>★</Text>
                                <Text style={{ fontSize: 12, color: '#6b7280', marginLeft: 4 }}>{item.driver?.rating || 'New'}</Text>
                                <Text style={{ fontSize: 12, color: '#6b7280', marginHorizontal: 4 }}>•</Text>
                                <Text style={{ fontSize: 12, color: '#6b7280' }}>{item.driver?.trips || 0} trips</Text>
                            </View>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <Text style={{ fontWeight: '600' }}>{item.from}</Text>
                        <Text style={{ marginHorizontal: 8, color: '#6b7280' }}>→</Text>
                        <Text style={{ fontWeight: '600' }}>{item.to}</Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 12, color: '#6b7280' }}>
                            {item.departure_date} • {item.departure_time} • {item.available_seats} seats left
                        </Text>
                    </View>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#059669' }}>${item.price_per_seat}</Text>
                    <Text style={{ fontSize: 12, color: '#6b7280' }}>per seat</Text>
                    {item.type && (
                        <View style={{
                            backgroundColor: item.type === 'wasel' ? '#dbeafe' : '#f3f4f6',
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 12,
                            marginTop: 4
                        }}>
                            <Text style={{ fontSize: 10, color: item.type === 'wasel' ? '#1e40af' : '#374151' }}>
                                {item.type === 'wasel' ? 'Wasel (واصل)' : 'Raje3 (راجع)'}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
            <View style={{ padding: 16 }}>
                {/* Mode Selection */}
                <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 16 }}>
                    <TouchableOpacity
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderRadius: 20,
                            marginHorizontal: 4,
                            backgroundColor: activeTab === 'basic' ? '#3b82f6' : '#e5e7eb'
                        }}
                        onPress={() => setActiveTab('basic')}
                    >
                        <Text style={{ marginLeft: 8, color: activeTab === 'basic' ? 'white' : '#374151' }}>🔍 Basic Search</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderRadius: 20,
                            marginHorizontal: 4,
                            backgroundColor: activeTab === 'ai' ? '#7c3aed' : '#e5e7eb'
                        }}
                        onPress={() => setActiveTab('ai')}
                    >
                        <Text style={{ marginLeft: 8, color: activeTab === 'ai' ? 'white' : '#374151' }}>🤖 AI Marketplace</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderRadius: 20,
                            marginHorizontal: 4,
                            backgroundColor: activeTab === 'analytics' ? '#3b82f6' : '#e5e7eb'
                        }}
                        onPress={() => setActiveTab('analytics')}
                    >
                        <Text style={{ marginLeft: 8, color: activeTab === 'analytics' ? 'white' : '#374151' }}>📊 Analytics</Text>
                    </TouchableOpacity>
                </View>

                {activeTab === 'basic' && (
                    <>
                        {/* Search Section */}
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
                            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Find a Ride</Text>

                            <View style={{ marginBottom: 12 }}>
                                <Text style={{ fontSize: 14, marginBottom: 4 }}>From</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12 }}>
                                    <Text style={{ color: '#6b7280' }}>📍</Text>
                                    <TextInput
                                        style={{ flex: 1, paddingVertical: 12, paddingLeft: 8 }}
                                        placeholder="Starting location"
                                        value={searchFrom}
                                        onChangeText={setSearchFrom}
                                    />
                                </View>
                            </View>

                            <View style={{ marginBottom: 12 }}>
                                <Text style={{ fontSize: 14, marginBottom: 4 }}>To</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12 }}>
                                    <Text style={{ color: '#6b7280' }}>📍</Text>
                                    <TextInput
                                        style={{ flex: 1, paddingVertical: 12, paddingLeft: 8 }}
                                        placeholder="Destination"
                                        value={searchTo}
                                        onChangeText={setSearchTo}
                                    />
                                </View>
                            </View>

                            <View style={{ marginBottom: 12 }}>
                                <Text style={{ fontSize: 14, marginBottom: 4 }}>Date</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12 }}>
                                    <Text style={{ color: '#6b7280' }}>📅</Text>
                                    <TextInput
                                        style={{ flex: 1, paddingVertical: 12, paddingLeft: 8 }}
                                        placeholder="YYYY-MM-DD"
                                        value={searchDate}
                                        onChangeText={setSearchDate}
                                    />
                                </View>
                            </View>

                            <View style={{ marginBottom: 16 }}>
                                <Text style={{ fontSize: 14, marginBottom: 4 }}>Passengers</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12 }}>
                                    <Text style={{ color: '#6b7280' }}>👥</Text>
                                    <TextInput
                                        style={{ flex: 1, paddingVertical: 12, paddingLeft: 8 }}
                                        placeholder="1-8"
                                        keyboardType="numeric"
                                        value={passengers}
                                        onChangeText={setPassengers}
                                    />
                                </View>
                            </View>

                            <TouchableOpacity
                                style={{
                                    backgroundColor: '#3b82f6',
                                    paddingVertical: 12,
                                    borderRadius: 8,
                                    alignItems: 'center'
                                }}
                                onPress={handleSearch}
                                disabled={loading}
                            >
                                <Text style={{ color: 'white', fontWeight: '600' }}>
                                    {loading ? 'Searching...' : 'Search Rides'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Error Display */}
                        {error && (
                            <View style={{
                                backgroundColor: '#fef2f2',
                                padding: 12,
                                borderRadius: 8,
                                marginBottom: 16,
                                borderWidth: 1,
                                borderColor: '#fecaca'
                            }}>
                                <Text style={{ color: '#dc2626', textAlign: 'center' }}>
                                    {error}
                                </Text>
                            </View>
                        )}

                        {/* Available Rides */}
                        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Available Rides</Text>

                        {loading && <Text style={{ textAlign: 'center', padding: 16 }}>Loading rides...</Text>}
                        {!loading && rides.length === 0 && !error && (
                            <Text style={{ textAlign: 'center', padding: 16, color: '#6b7280' }}>
                                {searchFrom || searchTo ? 'No rides found. Try changing your search criteria.' : 'Enter your trip details and tap "Search Rides" to find available rides.'}
                            </Text>
                        )}

                        <FlatList
                            data={rides}
                            renderItem={renderRideItem}
                            keyExtractor={(item) => item.id}
                            showsVerticalScrollIndicator={false}
                        />
                    </>
                )}

                {activeTab === 'ai' && (
                    <View style={{ padding: 16, alignItems: 'center' }}>
                        <Text style={{ fontSize: 16 }}>AI Marketplace coming soon...</Text>
                    </View>
                )}

                {activeTab === 'analytics' && (
                    <View style={{ padding: 16, alignItems: 'center' }}>
                        <Text style={{ fontSize: 16 }}>Analytics coming soon...</Text>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}