import { supabase } from './api';

export const integrationService = {
  stripe: {
    async createPaymentIntent(amount: number, currency: string) {
      const { data, error } = await supabase.functions.invoke('payment-create-intent', {
        body: { amount, currency }
      });
      if (error) throw error;
      return data;
    },

    async confirmPayment(paymentIntentId: string) {
      const { data, error } = await supabase.functions.invoke('payment-confirm', {
        body: { paymentIntentId }
      });
      if (error) throw error;
      return data;
    }
  },

  twilio: {
    async sendSMS(to: string, message: string) {
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: { to, message }
      });
      if (error) throw error;
      return data;
    },

    async makeCall(to: string, from: string) {
      const { data, error } = await supabase.functions.invoke('make-call', {
        body: { to, from }
      });
      if (error) throw error;
      return data;
    }
  },

  sendgrid: {
    async sendEmail(to: string, subject: string, html: string) {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: { to, subject, html }
      });
      if (error) throw error;
      return data;
    }
  },

  firebase: {
    async sendPushNotification(tokens: string[], title: string, body: string, data?: any) {
      const { data: result, error } = await supabase.functions.invoke('send-push', {
        body: { tokens, title, body, data }
      });
      if (error) throw error;
      return result;
    }
  },

  jumio: {
    async initiateVerification(userId: string) {
      const { data, error } = await supabase.functions.invoke('jumio-verify', {
        body: { userId }
      });
      if (error) throw error;
      return data;
    }
  },

  googleMaps: {
    async geocode(address: string) {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
      );
      return response.json();
    },

    async getDirections(origin: string, destination: string) {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}`
      );
      return response.json();
    }
  }
};
