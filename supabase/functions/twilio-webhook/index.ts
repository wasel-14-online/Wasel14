import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

// Receives Twilio inbound SMS/webhook and writes to Supabase table `incoming_sms`
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  const body = req.body || {};
  const { From, To, Body } = body;

  const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return res.status(500).json({ error: 'Missing supabase config' });

  try {
    await fetch(`${SUPABASE_URL}/rest/v1/incoming_sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ from: From, to: To, body: Body }),
    });
    return res.status(200).send('<Response></Response>');
  } catch (err) {
    console.error('twilio webhook error', err);
    return res.status(500).json({ error: String(err) });
  }
}
