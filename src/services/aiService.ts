import { supabase } from './api';
import { Location } from '../types';

export const aiService = {
  async optimizeRoute(waypoints: Location[]): Promise<Location[]> {
    const { data, error } = await supabase.functions.invoke('ai-optimize-route', {
      body: { waypoints }
    });

    if (error) throw error;
    return data.optimizedRoute;
  },

  async calculateDynamicPricing(distance: number, time: string, demand: number): Promise<number> {
    const { data, error } = await supabase.functions.invoke('ai-dynamic-pricing', {
      body: { distance, time, demand }
    });

    if (error) throw error;
    return data.surgeMultiplier;
  },

  async assessRisk(userId: string, tripData: any): Promise<{ score: number; flags: string[] }> {
    const { data, error } = await supabase.functions.invoke('ai-risk-assessment', {
      body: { userId, tripData }
    });

    if (error) throw error;
    return data;
  },

  async searchLocation(query: string): Promise<Location[]> {
    const { data, error } = await supabase.functions.invoke('ai-location-search', {
      body: { query }
    });

    if (error) throw error;
    return data.locations;
  },

  async getRecommendations(userId: string): Promise<any[]> {
    const { data, error } = await supabase.functions.invoke('ai-recommendations', {
      body: { userId }
    });

    if (error) throw error;
    return data.recommendations;
  },

  async matchDriver(tripData: any): Promise<string> {
    const { data, error } = await supabase.functions.invoke('ai-driver-matching', {
      body: { tripData }
    });

    if (error) throw error;
    return data.driverId;
  },

  async detectFraud(transactionData: any): Promise<{ isFraud: boolean; confidence: number }> {
    const { data, error } = await supabase.functions.invoke('ai-fraud-detection', {
      body: { transactionData }
    });

    if (error) throw error;
    return data;
  },

  async predictDemand(location: Location, time: string): Promise<number> {
    const { data, error } = await supabase.functions.invoke('ai-demand-prediction', {
      body: { location, time }
    });

    if (error) throw error;
    return data.demandScore;
  }
};
