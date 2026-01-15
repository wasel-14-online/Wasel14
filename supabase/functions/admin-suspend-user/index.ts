// Supabase Edge Function: Admin Suspend User
// Purpose: Suspend/unsuspend user account
// Endpoint: /functions/v1/admin-suspend-user

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Initialize regular client for user auth
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get current user and verify admin role
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin
    const { data: profile } = await supabaseClient
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      throw new Error('Admin access required');
    }

    // Parse request
    const { userId, suspend, reason } = await req.json();

    if (!userId) {
      throw new Error('User ID is required');
    }

    // Update user status
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .update({
        is_suspended: suspend,
        suspended_reason: suspend ? reason : null,
        suspended_at: suspend ? new Date().toISOString() : null,
        suspended_by: suspend ? user.id : null,
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log admin action
    await supabaseAdmin.from('admin_actions').insert({
      admin_id: user.id,
      action_type: suspend ? 'suspend_user' : 'unsuspend_user',
      target_user_id: userId,
      reason: reason,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        user: data,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('User suspension error:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to suspend user',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
