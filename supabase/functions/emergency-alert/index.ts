import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';
import Twilio from 'twilio';

// POST /emergency-alert { tripId, userId, level, message }
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  const { tripId, userId, level = 'critical', message = '' } = req.body || {};
  if (!tripId) return res.status(400).json({ error: 'Missing tripId' });

  const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const FCM_SERVER_KEY = process.env.FCM_SERVER_KEY;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return res.status(500).json({ error: 'Missing supabase config' });

  try {
    // Insert alert
    const insertResp = await fetch(`${SUPABASE_URL}/rest/v1/emergency_alerts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ trip_id: tripId, user_id: userId || null, level, message }),
    });
    if (!insertResp.ok) {
      const text = await insertResp.text();
      return res.status(500).json({ error: 'Failed to create alert', details: text });
    }

    // Fetch push tokens for trip participants (simplified: all tokens)
    const tokensResp = await fetch(`${SUPABASE_URL}/rest/v1/push_tokens?select=token`, {
      headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` },
    });
    const tokens = (await tokensResp.json()).map((r: any) => r.token).filter(Boolean);

    // Send push via FCM legacy API if key exists
    if (FCM_SERVER_KEY && tokens.length) {
      const fcmResp = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `key=${FCM_SERVER_KEY}` },
        body: JSON.stringify({ registration_ids: tokens.slice(0, 1000), notification: { title: 'Emergency Alert', body: message } }),
      });
      // ignore fcm errors for now
    }

    // Optionally send SMS via Twilio SDK
    const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
    const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
    const TWILIO_FROM = process.env.TWILIO_FROM_NUMBER;
    const emergencyNumber = process.env.EMERGENCY_CONTACT_NUMBER;
    if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_FROM && emergencyNumber) {
      try {
        const client = Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
        await client.messages.create({ from: TWILIO_FROM, to: emergencyNumber, body: `${level.toUpperCase()}: ${message}` });
      } catch (err) {
        console.error('twilio sdk send failed', err);
      }
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('emergency-alert error', err);
    return res.status(500).json({ error: String(err) });
  }
}
