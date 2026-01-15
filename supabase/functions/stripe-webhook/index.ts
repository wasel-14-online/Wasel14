import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2022-11-15' });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  const sig = req.headers['stripe-signature'] as string | undefined;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event: Stripe.Event;
  try {
    if (webhookSecret && sig) {
      const buf = Buffer.from(req.body as any, 'utf8');
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } else {
      // Fallback: unsafe parse
      event = req.body as Stripe.Event;
    }
  } catch (err) {
    console.error('Stripe webhook signature verification failed.', err);
    return res.status(400).send(`Webhook Error: ${err}`);
  }

  // Handle important events
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        // TODO: fulfill order, update DB
        break;
      case 'invoice.payment_succeeded':
        // TODO: subscription handling
        break;
      default:
        break;
    }
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Stripe webhook handler error', err);
    return res.status(500).json({ error: String(err) });
  }
}
