import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

// This function expects a POST with { token, userId }
// It stores the token in a `push_tokens` table using Supabase service role key.

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { token, userId } = req.body || {};
  if (!token) return res.status(400).json({ error: 'Missing token' });

  const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Missing supabase config' });
  }

  try {
    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/push_tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ token, user_id: userId, created_at: new Date().toISOString() }),
    });

    if (!insertRes.ok) {
      const text = await insertRes.text();
      return res.status(500).json({ error: 'Failed to store token', details: text });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Exception', details: String(err) });
  }
}
