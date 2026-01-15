import { View } from 'react-native';
import { FindRide } from '../../src/components/FindRide';
import { StatusBar } from 'expo-status-bar';

export default function SearchScreen() {
    return (
        <View style={{ flex: 1, paddingTop: 50 }}>
            <StatusBar style="dark" />
            <FindRide />
        </View>
    );
}
