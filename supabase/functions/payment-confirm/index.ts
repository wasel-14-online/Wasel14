// Supabase Edge Function: Confirm Payment
// Purpose: Confirm a Stripe payment and update database
// Endpoint: /functions/v1/payment-confirm

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.7.0?target=deno';
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
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Parse request
    const { paymentIntentId, tripId } = await req.json();

    if (!paymentIntentId || !tripId) {
      throw new Error('Missing required parameters');
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      throw new Error('Payment not completed');
    }

    // Update trip payment status in database
    const { data, error } = await supabaseClient
      .from('trips')
      .update({
        payment_status: 'paid',
        payment_intent_id: paymentIntentId,
        paid_at: new Date().toISOString(),
      })
      .eq('id', tripId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Record payment transaction
    await supabaseClient.from('transactions').insert({
      trip_id: tripId,
      payment_intent_id: paymentIntentId,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      status: 'completed',
      provider: 'stripe',
    });

    return new Response(
      JSON.stringify({
        success: true,
        trip: data,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Payment confirmation error:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to confirm payment',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
