import { supabase } from './api';

export const adminService = {
  async getAllUsers(page = 1, limit = 50) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('users')
      .select('*', { count: 'exact' })
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { users: data, total: count };
  },

  async banUser(userId: string, reason: string) {
    const { data, error } = await supabase
      .from('users')
      .update({ status: 'banned', ban_reason: reason, banned_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async suspendUser(userId: string, days: number, reason: string) {
    const suspendUntil = new Date();
    suspendUntil.setDate(suspendUntil.getDate() + days);

    const { data, error } = await supabase
      .from('users')
      .update({
        status: 'suspended',
        suspend_reason: reason,
        suspended_until: suspendUntil.toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getLiveTrips() {
    const { data, error } = await supabase
      .from('trips')
      .select('*, passenger:users!passenger_id(*), driver:users!driver_id(*)')
      .in('status', ['accepted', 'driver_arriving', 'in_progress'])
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getPlatformMetrics(startDate: string, endDate: string) {
    const { data, error } = await supabase.rpc('get_admin_metrics', {
      start_date: startDate,
      end_date: endDate
    });

    if (error) throw error;
    return data;
  },

  async getFinancialReport(startDate: string, endDate: string) {
    const { data, error } = await supabase.rpc('get_financial_report', {
      start_date: startDate,
      end_date: endDate
    });

    if (error) throw error;
    return data;
  },

  async sendBulkNotification(userIds: string[], title: string, message: string) {
    const { data, error } = await supabase.functions.invoke('send-bulk-notification', {
      body: { userIds, title, message }
    });

    if (error) throw error;
    return data;
  },

  async getFraudAlerts() {
    const { data, error } = await supabase
      .from('fraud_alerts')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};
