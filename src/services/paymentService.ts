import { supabase } from './api';

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed';
  client_secret?: string;
}

export const paymentService = {
  async createPaymentIntent(amount: number, currency: string, tripId: string): Promise<PaymentIntent> {
    const { data, error } = await supabase.functions.invoke('payment-create-intent', {
      body: { amount, currency, tripId }
    });
    
    if (error) throw error;
    return data;
  },

  async confirmPayment(paymentIntentId: string): Promise<PaymentIntent> {
    const { data, error } = await supabase.functions.invoke('payment-confirm', {
      body: { paymentIntentId }
    });
    
    if (error) throw error;
    return data;
  },

  async processRefund(tripId: string, amount: number, reason: string) {
    const { data, error } = await supabase
      .from('refunds')
      .insert({ trip_id: tripId, amount, reason, status: 'pending' })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getPaymentMethods(userId: string) {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data;
  },

  async addPaymentMethod(userId: string, paymentMethodId: string, type: string) {
    const { data, error } = await supabase
      .from('payment_methods')
      .insert({ user_id: userId, payment_method_id: paymentMethodId, type })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};
