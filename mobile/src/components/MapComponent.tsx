import React from 'react';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { View, Text } from 'react-native';

interface MapLocation {
    lat: number;
    lng: number;
    label: string;
    type: 'start' | 'stop' | 'destination' | 'current';
}

interface MapComponentProps {
    locations: MapLocation[];
    showRoute?: boolean;
    center?: [number, number];
    zoom?: number;
    height?: number;
    style?: any;
}

export function MapComponent({
    locations,
    showRoute = true,
    center,
    zoom = 10,
    height = 300,
    style
}: MapComponentProps) {
    // Determine center based on locations if not provided
    const mapCenter = center || (locations.length > 0
        ? { latitude: locations[0].lat, longitude: locations[0].lng }
        : { latitude: 25.2048, longitude: 55.2708 }); // Default: Dubai

    // Calculate region based on zoom
    const region = {
        ...mapCenter,
        latitudeDelta: 0.0922 / Math.pow(2, zoom - 1), // Approximate delta for zoom level
        longitudeDelta: 0.0421 / Math.pow(2, zoom - 1),
    };

    // Prepare markers and route points
    const markers = locations.map((loc, index) => ({
        ...loc,
        coordinate: { latitude: loc.lat, longitude: loc.lng },
        key: `marker-${index}`,
    }));

    const routePoints = locations.map(loc => ({
        latitude: loc.lat,
        longitude: loc.lng,
    }));

    const getMarkerColor = (type: string) => {
        switch (type) {
            case 'destination':
                return '#ef4444';
            case 'stop':
                return '#10b981';
            case 'current':
                return '#3b82f6';
            default:
                return '#059669';
        }
    };

    const getMarkerTitle = (type: string) => {
        switch (type) {
            case 'start':
                return 'Starting Point';
            case 'destination':
                return 'Destination';
            case 'current':
                return 'Current Location';
            default:
                return 'Stop';
        }
    };

    if (locations.length === 0) {
        return (
            <View style={[{ height, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f4f6' }, style]}>
                <Text style={{ color: '#6b7280' }}>No locations to display</Text>
            </View>
        );
    }

    return (
        <View style={[{ height }, style]}>
            <MapView
                provider={PROVIDER_GOOGLE}
                style={{ flex: 1 }}
                region={region}
                showsUserLocation={false}
                showsMyLocationButton={false}
                zoomEnabled={true}
                scrollEnabled={true}
            >
                {/* Markers */}
                {markers.map((marker) => (
                    <Marker
                        key={marker.key}
                        coordinate={marker.coordinate}
                        title={marker.label}
                        description={getMarkerTitle(marker.type)}
                        pinColor={getMarkerColor(marker.type)}
                    />
                ))}

                {/* Route Polyline */}
                {showRoute && routePoints.length > 1 && (
                    <Polyline
                        coordinates={routePoints}
                        strokeColor="#3b82f6"
                        strokeWidth={4}
                        lineDashPattern={[0]}
                    />
                )}
            </MapView>
        </View>
    );
}