import { supabase } from './api';

export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'expired';
export type DocumentType = 'drivers_license' | 'national_id' | 'passport' | 'vehicle_registration' | 'insurance';

export interface VerificationDocument {
  id: string;
  user_id: string;
  type: DocumentType;
  status: VerificationStatus;
  document_url: string;
  expiry_date?: string;
  rejection_reason?: string;
  verified_at?: string;
  created_at: string;
}

export const verificationService = {
  async uploadDocument(userId: string, type: DocumentType, file: File, expiryDate?: string) {
    // Upload file to Supabase Storage
    const fileName = `${userId}/${type}_${Date.now()}.${file.name.split('.').pop()}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('verification-documents')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const {
      data: { publicUrl }
    } = supabase.storage.from('verification-documents').getPublicUrl(fileName);

    // Create verification record
    const { data, error } = await supabase
      .from('verification_documents')
      .insert({
        user_id: userId,
        type,
        document_url: publicUrl,
        expiry_date: expiryDate,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateVerificationStatus(documentId: string, status: VerificationStatus, rejectionReason?: string) {
    const updates: any = { status };
    if (status === 'approved') {
      updates.verified_at = new Date().toISOString();
    }
    if (rejectionReason) {
      updates.rejection_reason = rejectionReason;
    }

    const { data, error } = await supabase
      .from('verification_documents')
      .update(updates)
      .eq('id', documentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserDocuments(userId: string) {
    const { data, error } = await supabase
      .from('verification_documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async checkDriverVerification(userId: string): Promise<boolean> {
    const { data } = await supabase
      .from('verification_documents')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'approved')
      .in('type', ['drivers_license', 'vehicle_registration', 'insurance']);

    return data?.length === 3;
  },

  async getPendingVerifications() {
    const { data, error } = await supabase
      .from('verification_documents')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }
};
