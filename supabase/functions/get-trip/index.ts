import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');
  // Expect path like /api/trips/:id
  const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
  const parts = url.pathname.split('/').filter(Boolean);
  const tripId = parts[parts.length - 1];
  if (!tripId) return res.status(400).json({ error: 'Missing trip id' });

  const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return res.status(500).json({ error: 'Missing supabase config' });

  try {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/trips?id=eq.${encodeURIComponent(tripId)}&select=*`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    });
    if (!resp.ok) {
      const text = await resp.text();
      return res.status(500).json({ error: 'Failed to fetch trip', details: text });
    }
    const data = await resp.json();
    return res.status(200).json(data[0] || null);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
