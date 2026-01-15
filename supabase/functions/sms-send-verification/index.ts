// SMS Verification Sending
// Endpoint: /functions/v1/sms-send-verification

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')
const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { phoneNumber, code } = await req.json()

    if (!phoneNumber) {
      throw new Error('Phone number required')
    }

    if (!code) {
      throw new Error('Verification code required')
    }

    // Validate Twilio configuration
    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      console.error('Twilio not configured')
      return new Response(
        JSON.stringify({
          success: true,
          message: 'SMS would be sent in production',
          demo: true,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Send SMS via Twilio
    const auth = btoa(`${twilioAccountSid}:${twilioAuthToken}`)
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: phoneNumber,
          From: twilioPhoneNumber,
          Body: `Your Wassel verification code is: ${code}. Valid for 10 minutes.`,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to send SMS')
    }

    const data = await response.json()

    return new Response(
      JSON.stringify({
        success: true,
        messageId: data.sid,
        status: data.status,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('SMS sending failed:', error)

    return new Response(
      JSON.stringify({
        error: error.message,
        details: 'Failed to send SMS verification',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
