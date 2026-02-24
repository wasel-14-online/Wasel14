import { supabase } from './api';
import { Location } from '../types';

export const realTimeTrackingService = {
  async updateDriverLocation(driverId: string, location: Location) {
    const { error } = await supabase.from('driver_locations').upsert({
      driver_id: driverId,
      location: `POINT(${location.lng} ${location.lat})`,
      updated_at: new Date().toISOString()
    });

    if (error) throw error;

    await supabase.channel(`driver:${driverId}`).send({
      type: 'broadcast',
      event: 'location_update',
      payload: location
    });
  },

  subscribeToDriverLocation(driverId: string, callback: (location: Location) => void) {
    return supabase
      .channel(`driver:${driverId}`)
      .on('broadcast', { event: 'location_update' }, ({ payload }) => {
        callback(payload as Location);
      })
      .subscribe();
  },

  async getTripRoute(tripId: string) {
    const { data, error } = await supabase
      .from('trip_routes')
      .select('*')
      .eq('trip_id', tripId)
      .order('timestamp', { ascending: true });

    if (error) throw error;
    return data;
  },

  async saveRoutePoint(tripId: string, location: Location) {
    const { error } = await supabase.from('trip_routes').insert({
      trip_id: tripId,
      location: `POINT(${location.lng} ${location.lat})`,
      timestamp: new Date().toISOString()
    });

    if (error) throw error;
  },

  calculateETA(currentLocation: Location, destination: Location, averageSpeed = 40): number {
    const R = 6371;
    const dLat = ((destination.lat - currentLocation.lat) * Math.PI) / 180;
    const dLng = ((destination.lng - currentLocation.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((currentLocation.lat * Math.PI) / 180) *
        Math.cos((destination.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round((distance / averageSpeed) * 60);
  }
};
