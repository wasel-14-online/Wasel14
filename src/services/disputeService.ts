import { supabase } from './api';

export type DisputeStatus = 'open' | 'investigating' | 'resolved' | 'closed';
export type DisputeType = 'fare' | 'driver_behavior' | 'route' | 'payment' | 'safety' | 'other';

export interface Dispute {
  id: string;
  trip_id: string;
  reporter_id: string;
  reported_id: string;
  type: DisputeType;
  status: DisputeStatus;
  description: string;
  evidence?: string[];
  resolution?: string;
  created_at: string;
  resolved_at?: string;
}

export const disputeService = {
  async createDispute(disputeData: Omit<Dispute, 'id' | 'created_at' | 'status'>) {
    const { data, error } = await supabase
      .from('disputes')
      .insert({ ...disputeData, status: 'open' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateDisputeStatus(disputeId: string, status: DisputeStatus, resolution?: string) {
    const updates: any = { status };
    if (resolution) {
      updates.resolution = resolution;
      updates.resolved_at = new Date().toISOString();
    }

    const { data, error } = await supabase.from('disputes').update(updates).eq('id', disputeId).select().single();

    if (error) throw error;
    return data;
  },

  async addEvidence(disputeId: string, evidenceUrl: string) {
    const { data: dispute } = await supabase.from('disputes').select('evidence').eq('id', disputeId).single();

    const evidence = dispute?.evidence || [];
    evidence.push(evidenceUrl);

    const { data, error } = await supabase.from('disputes').update({ evidence }).eq('id', disputeId).select().single();

    if (error) throw error;
    return data;
  },

  async getUserDisputes(userId: string) {
    const { data, error } = await supabase
      .from('disputes')
      .select('*')
      .or(`reporter_id.eq.${userId},reported_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getAllDisputes(status?: DisputeStatus) {
    let query = supabase.from('disputes').select('*').order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
};
