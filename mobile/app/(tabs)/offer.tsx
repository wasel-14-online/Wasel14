import { View } from 'react-native';
import { OfferRide } from '../../src/components/OfferRide';
import { StatusBar } from 'expo-status-bar';

export default function OfferScreen() {
    return (
        <View style={{ flex: 1, paddingTop: 50 }}>
            <StatusBar style="dark" />
            <OfferRide />
        </View>
    );
}
