import { supabase } from './api';

export type EventType = 'page_view' | 'trip_request' | 'trip_complete' | 'payment' | 'signup' | 'login' | 'search';

export interface AnalyticsEvent {
  event_type: EventType;
  user_id?: string;
  properties?: Record<string, any>;
  timestamp: string;
}

export const analyticsService = {
  async trackEvent(eventType: EventType, properties?: Record<string, any>) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const event: AnalyticsEvent = {
      event_type: eventType,
      user_id: user?.id,
      properties,
      timestamp: new Date().toISOString()
    };
    
    // Store in database
    await supabase.from('analytics_events').insert(event);
    
    // Send to external analytics (Mixpanel)
    if (window.mixpanel) {
      window.mixpanel.track(eventType, properties);
    }
  },

  async trackPageView(page: string) {
    await this.trackEvent('page_view', { page });
  },

  async trackTripRequest(pickup: string, dropoff: string, fare: number) {
    await this.trackEvent('trip_request', { pickup, dropoff, fare });
  },

  async trackTripComplete(tripId: string, fare: number, rating: number) {
    await this.trackEvent('trip_complete', { tripId, fare, rating });
  },

  async getUserAnalytics(userId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', startDate)
      .lte('timestamp', endDate);
    
    if (error) throw error;
    return data;
  },

  async getPlatformMetrics(startDate: string, endDate: string) {
    const { data, error } = await supabase.rpc('get_platform_metrics', {
      start_date: startDate,
      end_date: endDate
    });
    
    if (error) throw error;
    return data;
  }
};

// Extend Window interface for Mixpanel
declare global {
  interface Window {
    mixpanel?: any;
  }
}
