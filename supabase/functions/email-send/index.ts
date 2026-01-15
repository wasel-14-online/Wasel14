// Supabase Edge Function: Send Email
// Purpose: Send emails via SendGrid
// Endpoint: /functions/v1/email-send

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');

    if (!SENDGRID_API_KEY) {
      throw new Error('SendGrid API key not configured');
    }

    // Parse request
    const {
      to,
      subject,
      html,
      text,
      from = 'noreply@wassel.app',
      templateId,
      dynamicTemplateData,
    } = await req.json();

    if (!to || !subject) {
      throw new Error('Missing required parameters: to and subject');
    }

    // Prepare SendGrid request
    const emailData: any = {
      personalizations: [
        {
          to: [{ email: to }],
          dynamic_template_data: dynamicTemplateData,
        },
      ],
      from: { email: from, name: 'Wassel' },
      subject: subject,
    };

    // Use template or content
    if (templateId) {
      emailData.template_id = templateId;
    } else {
      emailData.content = [
        {
          type: 'text/plain',
          value: text || '',
        },
        {
          type: 'text/html',
          value: html || text || '',
        },
      ];
    }

    // Send email via SendGrid
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors?.[0]?.message || 'Failed to send email');
    }

    return new Response(
      JSON.stringify({
        success: true,
        messageId: response.headers.get('x-message-id'),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Email send error:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to send email',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
