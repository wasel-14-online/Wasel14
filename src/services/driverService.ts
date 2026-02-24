import { supabase } from './api';

export interface Driver {
  id: string;
  user_id: string;
  status: 'offline' | 'online' | 'busy';
  current_location?: { lat: number; lng: number };
  rating: number;
  total_trips: number;
  earnings_today: number;
  earnings_week: number;
  earnings_month: number;
}

export const driverService = {
  async updateDriverStatus(driverId: string, status: Driver['status']) {
    const { data, error } = await supabase
      .from('drivers')
      .update({ status })
      .eq('id', driverId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateDriverLocation(driverId: string, location: { lat: number; lng: number }) {
    const { data, error } = await supabase
      .from('drivers')
      .update({ current_location: location, last_location_update: new Date().toISOString() })
      .eq('id', driverId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getNearbyDrivers(location: { lat: number; lng: number }, radiusKm = 5) {
    const { data, error } = await supabase.rpc('get_nearby_drivers', {
      lat: location.lat,
      lng: location.lng,
      radius_km: radiusKm
    });
    
    if (error) throw error;
    return data;
  },

  async getDriverEarnings(driverId: string, period: 'today' | 'week' | 'month' | 'all') {
    const { data, error } = await supabase.rpc('get_driver_earnings', {
      driver_id: driverId,
      period
    });
    
    if (error) throw error;
    return data;
  },

  async requestPayout(driverId: string, amount: number) {
    const { data, error } = await supabase
      .from('payouts')
      .insert({ driver_id: driverId, amount, status: 'pending' })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};
