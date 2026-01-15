import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

// POST /update-trip with { tripId, updates }
// Requires service role key to modify trips table

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  const { tripId, updates } = req.body || {};
  if (!tripId || !updates) return res.status(400).json({ error: 'Missing tripId or updates' });

  const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return res.status(500).json({ error: 'Missing supabase config' });

  try {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/trips?id=eq.${encodeURIComponent(tripId)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify(updates),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return res.status(500).json({ error: 'Failed to update trip', details: text });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
