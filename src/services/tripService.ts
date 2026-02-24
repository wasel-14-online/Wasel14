import { supabase } from './api';

export type TripStatus = 'pending' | 'accepted' | 'driver_arriving' | 'in_progress' | 'completed' | 'cancelled';

export interface Trip {
  id: string;
  passenger_id: string;
  driver_id?: string;
  pickup_location: { lat: number; lng: number; address: string };
  dropoff_location: { lat: number; lng: number; address: string };
  status: TripStatus;
  fare: number;
  distance: number;
  duration: number;
  created_at: string;
  scheduled_time?: string;
}

export const tripService = {
  async createTrip(tripData: Omit<Trip, 'id' | 'created_at' | 'status'>) {
    const { data, error } = await supabase
      .from('trips')
      .insert({ ...tripData, status: 'pending' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async cancelTrip(tripId: string, reason: string) {
    const { data, error } = await supabase
      .from('trips')
      .update({ status: 'cancelled', cancellation_reason: reason })
      .eq('id', tripId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTripStatus(tripId: string, status: TripStatus) {
    const { data, error } = await supabase.from('trips').update({ status }).eq('id', tripId).select().single();

    if (error) throw error;
    return data;
  },

  async getTripById(tripId: string) {
    const { data, error } = await supabase.from('trips').select('*').eq('id', tripId).single();

    if (error) throw error;
    return data;
  },

  async getUserTrips(userId: string, limit = 50) {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .or(`passenger_id.eq.${userId},driver_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  subscribeToTrip(tripId: string, callback: (trip: Trip) => void) {
    return supabase
      .channel(`trip:${tripId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trips', filter: `id=eq.${tripId}` }, payload =>
        callback(payload.new as Trip)
      )
      .subscribe();
  }
};
