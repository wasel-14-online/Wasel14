import { View } from 'react-native';
import { MyTrips } from '../../src/components/MyTrips';
import { StatusBar } from 'expo-status-bar';

export default function TripsScreen() {
    return (
        <View style={{ flex: 1, paddingTop: 50 }}>
            <StatusBar style="dark" />
            <MyTrips />
        </View>
    );
}
