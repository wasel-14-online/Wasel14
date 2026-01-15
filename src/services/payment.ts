export async function createCheckoutSession(priceId: string, successUrl: string, cancelUrl: string) {
  const res = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ priceId, success_url: successUrl, cancel_url: cancelUrl }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create checkout session: ${text}`);
  }
  return res.json();
}

export default { createCheckoutSession };
