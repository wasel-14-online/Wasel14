export async function sendSms(to: string, body: string) {
  const res = await fetch('/api/twilio-send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, body }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to send SMS: ${text}`);
  }
  return res.json();
}

export default { sendSms };
