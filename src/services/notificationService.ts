import { supabase } from './api';

export type NotificationType = 'trip_update' | 'payment' | 'promo' | 'system' | 'safety';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  created_at: string;
}

export const notificationService = {
  async sendNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, any>
  ) {
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({ user_id: userId, type, title, message, data, read: false })
      .select()
      .single();

    if (error) throw error;

    // Send push notification
    await this.sendPushNotification(userId, title, message, data);

    return notification;
  },

  async sendPushNotification(userId: string, title: string, body: string, data?: Record<string, any>) {
    const { data: tokens } = await supabase.from('push_tokens').select('token').eq('user_id', userId);

    if (!tokens?.length) return;

    // Call Firebase Cloud Messaging via edge function
    await supabase.functions.invoke('send-push', {
      body: { tokens: tokens.map(t => t.token), title, body, data }
    });
  },

  async sendSMS(phoneNumber: string, message: string) {
    await supabase.functions.invoke('send-sms', {
      body: { to: phoneNumber, message }
    });
  },

  async sendEmail(email: string, subject: string, html: string) {
    await supabase.functions.invoke('send-email', {
      body: { to: email, subject, html }
    });
  },

  async getUserNotifications(userId: string, limit = 50) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  async markAsRead(notificationId: string) {
    const { error } = await supabase.from('notifications').update({ read: true }).eq('id', notificationId);

    if (error) throw error;
  }
};
