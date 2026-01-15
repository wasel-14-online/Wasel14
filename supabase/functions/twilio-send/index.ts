import type { VercelRequest, VercelResponse } from '@vercel/node';
import Twilio from 'twilio';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  const { to, body } = req.body || {};
  if (!to || !body) return res.status(400).json({ error: 'Missing to or body' });

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!accountSid || !authToken || !from) return res.status(500).json({ error: 'Missing Twilio config' });

  const client = Twilio(accountSid, authToken);
  try {
    const msg = await client.messages.create({ to, from, body });
    return res.status(200).json({ sid: msg.sid, status: msg.status });
  } catch (err) {
    console.error('twilio send error', err);
    return res.status(500).json({ error: String(err) });
  }
}
