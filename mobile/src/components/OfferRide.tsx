import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Switch } from 'react-native';
import { MapPin, Calendar, Clock, Users, Car, Plus, X, Eye, Scale, Info, DollarSign, Package, TrendingUp, Shield, Truck } from 'lucide-react-native';
import { tripsAPI } from '../services/api';

interface Stop {
    label: string;
    lat: number;
    lng: number;
}

export function OfferRide() {
    const [tripType, setTripType] = useState('wasel');
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [stops, setStops] = useState<Stop[]>([]);
    const [newStopLabel, setNewStopLabel] = useState('');
    const [showRoutePreview, setShowRoutePreview] = useState(false);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [returnDate, setReturnDate] = useState('');
    const [returnTime, setReturnTime] = useState('');
    const [vehicle, setVehicle] = useState('');
    const [seats, setSeats] = useState('4');
    const [price, setPrice] = useState('');
    const [notes, setNotes] = useState('');
    const [acceptPackages, setAcceptPackages] = useState(false);

    const addStop = () => {
        if (newStopLabel.trim()) {
            // Mock coordinates
            const coords = { lat: 25.2048 + Math.random() * 0.1, lng: 55.2708 + Math.random() * 0.1 };
            setStops([...stops, { label: newStopLabel, ...coords }]);
            setNewStopLabel('');
        }
    };

    const removeStop = (index: number) => {
        setStops(stops.filter((_, i) => i !== index));
    };

    const handlePublish = async () => {
        if (!from || !to || !date || !time || !price) {
            Alert.alert('Error', 'Please enter all required details');
            return;
        }

        try {
            await tripsAPI.createTrip({
                from,
                to,
                departure_date: date,
                departure_time: time,
                available_seats: parseInt(seats),
                price_per_seat: parseFloat(price),
                vehicle_type: vehicle,
                notes
            });
            Alert.alert('Success', 'Ride published successfully!');
            // Reset form or navigate
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to publish ride');
        }
    };

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
            <View style={{ padding: 16 }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>Offer a Ride</Text>
                <Text style={{ fontSize: 16, color: '#6b7280', marginBottom: 24 }}>Share your journey and help others reach their destination</Text>

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
                    <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Trip Details</Text>

                    {/* Trip Type */}
                    <Text style={{ fontSize: 16, marginBottom: 12 }}>Trip Type</Text>
                    <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                        <TouchableOpacity
                            style={{
                                flex: 1,
                                alignItems: 'center',
                                padding: 16,
                                borderWidth: 2,
                                borderColor: tripType === 'wasel' ? '#3b82f6' : '#d1d5db',
                                borderRadius: 8,
                                marginRight: 8,
                                backgroundColor: tripType === 'wasel' ? '#eff6ff' : 'white'
                            }}
                            onPress={() => setTripType('wasel')}
                        >
                            <Text style={{ fontSize: 24, marginBottom: 8 }}>→</Text>
                            <Text style={{ fontWeight: '600' }}>Wasel (واصل)</Text>
                            <Text style={{ fontSize: 12, color: '#6b7280' }}>One-way trip</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{
                                flex: 1,
                                alignItems: 'center',
                                padding: 16,
                                borderWidth: 2,
                                borderColor: tripType === 'raje3' ? '#3b82f6' : '#d1d5db',
                                borderRadius: 8,
                                marginLeft: 8,
                                backgroundColor: tripType === 'raje3' ? '#eff6ff' : 'white'
                            }}
                            onPress={() => setTripType('raje3')}
                        >
                            <Text style={{ fontSize: 24, marginBottom: 8 }}>↔</Text>
                            <Text style={{ fontWeight: '600' }}>Raje3 (راجع)</Text>
                            <Text style={{ fontSize: 12, color: '#6b7280' }}>Return trip</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Route */}
                    <View style={{ marginBottom: 16 }}>
                        <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                            <View style={{ flex: 1, marginRight: 8 }}>
                                <Text style={{ fontSize: 14, marginBottom: 4 }}>From</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12 }}>
                                    <MapPin size={16} color="#6b7280" />
                                    <TextInput
                                        style={{ flex: 1, paddingVertical: 12, paddingLeft: 8 }}
                                        placeholder="Starting location"
                                        value={from}
                                        onChangeText={setFrom}
                                    />
                                </View>
                            </View>

                            <View style={{ flex: 1, marginLeft: 8 }}>
                                <Text style={{ fontSize: 14, marginBottom: 4 }}>To</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12 }}>
                                    <MapPin size={16} color="#6b7280" />
                                    <TextInput
                                        style={{ flex: 1, paddingVertical: 12, paddingLeft: 8 }}
                                        placeholder="Destination"
                                        value={to}
                                        onChangeText={setTo}
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Stops */}
                        <Text style={{ fontSize: 14, marginBottom: 8 }}>Stops Along the Way (Optional)</Text>

                        {stops.map((stop, index) => (
                            <View key={index} style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                padding: 12,
                                backgroundColor: '#f9fafb',
                                borderRadius: 8,
                                marginBottom: 8
                            }}>
                                <MapPin size={16} color="#059669" />
                                <Text style={{ flex: 1, marginLeft: 8 }}>{stop.label}</Text>
                                <TouchableOpacity onPress={() => removeStop(index)}>
                                    <X size={16} color="#ef4444" />
                                </TouchableOpacity>
                            </View>
                        ))}

                        <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12, flex: 1, marginRight: 8 }}>
                                <MapPin size={16} color="#6b7280" />
                                <TextInput
                                    style={{ flex: 1, paddingVertical: 12, paddingLeft: 8 }}
                                    placeholder="Add a stop"
                                    value={newStopLabel}
                                    onChangeText={setNewStopLabel}
                                    onSubmitEditing={addStop}
                                />
                            </View>
                            <TouchableOpacity
                                style={{
                                    backgroundColor: '#3b82f6',
                                    paddingHorizontal: 16,
                                    paddingVertical: 12,
                                    borderRadius: 8,
                                    justifyContent: 'center'
                                }}
                                onPress={addStop}
                            >
                                <Plus size={16} color="white" />
                            </TouchableOpacity>
                        </View>

                        {/* Route Preview Toggle */}
                        {(from || to || stops.length > 0) && (
                            <TouchableOpacity
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    padding: 12,
                                    borderWidth: 1,
                                    borderColor: '#d1d5db',
                                    borderRadius: 8,
                                    marginBottom: 16
                                }}
                                onPress={() => setShowRoutePreview(!showRoutePreview)}
                            >
                                <Eye size={16} color="#6b7280" />
                                <Text style={{ marginLeft: 8, flex: 1 }}>{showRoutePreview ? 'Hide Map' : 'Show Map'}</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Date & Time */}
                    <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <Text style={{ fontSize: 14, marginBottom: 4 }}>Departure Date</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12 }}>
                                <Calendar size={16} color="#6b7280" />
                                <TextInput
                                    style={{ flex: 1, paddingVertical: 12, paddingLeft: 8 }}
                                    placeholder="YYYY-MM-DD"
                                    value={date}
                                    onChangeText={setDate}
                                />
                            </View>
                        </View>

                        <View style={{ flex: 1, marginLeft: 8 }}>
                            <Text style={{ fontSize: 14, marginBottom: 4 }}>Departure Time</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12 }}>
                                <Clock size={16} color="#6b7280" />
                                <TextInput
                                    style={{ flex: 1, paddingVertical: 12, paddingLeft: 8 }}
                                    placeholder="HH:MM"
                                    value={time}
                                    onChangeText={setTime}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Return Trip */}
                    {tripType === 'raje3' && (
                        <View style={{ padding: 12, backgroundColor: '#f0f9ff', borderRadius: 8, marginBottom: 16 }}>
                            <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <Text style={{ fontSize: 14, marginBottom: 4 }}>Return Date</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12 }}>
                                        <Calendar size={16} color="#6b7280" />
                                        <TextInput
                                            style={{ flex: 1, paddingVertical: 12, paddingLeft: 8 }}
                                            placeholder="YYYY-MM-DD"
                                            value={returnDate}
                                            onChangeText={setReturnDate}
                                        />
                                    </View>
                                </View>

                                <View style={{ flex: 1, marginLeft: 8 }}>
                                    <Text style={{ fontSize: 14, marginBottom: 4 }}>Return Time</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12 }}>
                                        <Clock size={16} color="#6b7280" />
                                        <TextInput
                                            style={{ flex: 1, paddingVertical: 12, paddingLeft: 8 }}
                                            placeholder="HH:MM"
                                            value={returnTime}
                                            onChangeText={setReturnTime}
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Vehicle & Seats */}
                    <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <Text style={{ fontSize: 14, marginBottom: 4 }}>Vehicle Model</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12 }}>
                                <Car size={16} color="#6b7280" />
                                <TextInput
                                    style={{ flex: 1, paddingVertical: 12, paddingLeft: 8 }}
                                    placeholder="e.g., Toyota Camry"
                                    value={vehicle}
                                    onChangeText={setVehicle}
                                />
                            </View>
                        </View>

                        <View style={{ flex: 1, marginLeft: 8 }}>
                            <Text style={{ fontSize: 14, marginBottom: 4 }}>Available Seats</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12 }}>
                                <Users size={16} color="#6b7280" />
                                <TextInput
                                    style={{ flex: 1, paddingVertical: 12, paddingLeft: 8 }}
                                    placeholder="1-8"
                                    keyboardType="numeric"
                                    value={seats}
                                    onChangeText={setSeats}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Price */}
                    <View style={{ marginBottom: 16 }}>
                        <Text style={{ fontSize: 14, marginBottom: 4 }}>Price per Seat (USD)</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12 }}>
                            <DollarSign size={16} color="#6b7280" />
                            <TextInput
                                style={{ flex: 1, paddingVertical: 12, paddingLeft: 8 }}
                                placeholder="Enter price"
                                keyboardType="numeric"
                                value={price}
                                onChangeText={setPrice}
                            />
                        </View>
                        <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Set a fair price based on distance and fuel costs</Text>
                    </View>

                    {/* Package Delivery */}
                    <View style={{
                        padding: 16,
                        borderWidth: 2,
                        borderColor: '#e0e7ff',
                        borderRadius: 12,
                        backgroundColor: '#f8fafc',
                        marginBottom: 16
                    }}>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
                            <View style={{ padding: 8, backgroundColor: '#e0e7ff', borderRadius: 8, marginRight: 12 }}>
                                <Package size={20} color="#3b82f6" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>Accept Package Deliveries</Text>
                                <Text style={{ fontSize: 14, color: '#6b7280', lineHeight: 20 }}>
                                    Maximize your earnings by delivering packages along your route. Safe, secure, and simple.
                                </Text>
                                <View style={{ flexDirection: 'row', marginTop: 8 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
                                        <TrendingUp size={12} color="#059669" />
                                        <Text style={{ fontSize: 12, marginLeft: 4 }}>Earn up to 40% more</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Shield size={12} color="#059669" />
                                        <Text style={{ fontSize: 12, marginLeft: 4 }}>Insured packages</Text>
                                    </View>
                                </View>
                            </View>
                            <Switch
                                value={acceptPackages}
                                onValueChange={setAcceptPackages}
                            />
                        </View>

                        {acceptPackages && (
                            <View style={{ paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e0e7ff' }}>
                                <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>Select Package Sizes You Can Accept</Text>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <TouchableOpacity style={{
                                        flex: 1,
                                        padding: 12,
                                        borderWidth: 2,
                                        borderColor: '#d1d5db',
                                        borderRadius: 8,
                                        marginHorizontal: 4,
                                        alignItems: 'center'
                                    }}>
                                        <Package size={20} color="#3b82f6" />
                                        <Text style={{ fontSize: 12, marginTop: 4 }}>Small</Text>
                                        <Text style={{ fontSize: 10, color: '#6b7280' }}>Under 2kg</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={{
                                        flex: 1,
                                        padding: 12,
                                        borderWidth: 2,
                                        borderColor: '#d1d5db',
                                        borderRadius: 8,
                                        marginHorizontal: 4,
                                        alignItems: 'center'
                                    }}>
                                        <Package size={24} color="#3b82f6" />
                                        <Text style={{ fontSize: 12, marginTop: 4 }}>Medium</Text>
                                        <Text style={{ fontSize: 10, color: '#6b7280' }}>2-18kg</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={{
                                        flex: 1,
                                        padding: 12,
                                        borderWidth: 2,
                                        borderColor: '#d1d5db',
                                        borderRadius: 8,
                                        marginHorizontal: 4,
                                        alignItems: 'center'
                                    }}>
                                        <Truck size={24} color="#3b82f6" />
                                        <Text style={{ fontSize: 12, marginTop: 4 }}>Large</Text>
                                        <Text style={{ fontSize: 10, color: '#6b7280' }}>Over 20kg</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Notes */}
                    <View style={{ marginBottom: 24 }}>
                        <Text style={{ fontSize: 14, marginBottom: 4 }}>Additional Notes (Optional)</Text>
                        <TextInput
                            style={{
                                borderWidth: 1,
                                borderColor: '#d1d5db',
                                borderRadius: 8,
                                padding: 12,
                                minHeight: 80,
                                textAlignVertical: 'top'
                            }}
                            placeholder="Any special instructions or requirements for riders..."
                            multiline
                            value={notes}
                            onChangeText={setNotes}
                        />
                    </View>

                    {/* Buttons */}
                    <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity
                            style={{
                                flex: 1,
                                backgroundColor: '#e5e7eb',
                                paddingVertical: 12,
                                borderRadius: 8,
                                alignItems: 'center',
                                marginRight: 8
                            }}
                        >
                            <Text style={{ fontWeight: '600' }}>Save as Draft</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{
                                flex: 1,
                                backgroundColor: '#3b82f6',
                                paddingVertical: 12,
                                borderRadius: 8,
                                alignItems: 'center',
                                marginLeft: 8
                            }}
                            onPress={handlePublish}
                        >
                            <Text style={{ color: 'white', fontWeight: '600' }}>Publish Ride</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Tips */}
                <View style={{
                    backgroundColor: 'white',
                    padding: 16,
                    borderRadius: 8,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3
                }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Tips for a Great Ride</Text>
                    <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>✓ Be punctual and communicate any delays</Text>
                    <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>✓ Keep your vehicle clean and comfortable</Text>
                    <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>✓ Set fair prices based on distance and fuel costs</Text>
                    <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>✓ Be respectful and maintain good conversation</Text>
                    <Text style={{ fontSize: 14, color: '#6b7280' }}>✓ Follow safety guidelines and traffic rules</Text>
                </View>
            </View>
        </ScrollView>
    );
}