import { requestPushPermissionAndGetToken, onForegroundMessage } from '../firebase.client';

export async function registerForPush(userId?: string) {
  const token = await requestPushPermissionAndGetToken();
  if (!token) return null;
  try {
    await fetch('/api/register-push-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, user_id: userId || null, platform: 'web' }),
    });
  } catch (err) {
    console.warn('Failed to register push token', err);
  }
  return token;
}

export async function unregisterPush(token: string) {
  try {
    await fetch('/api/unregister-push-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
  } catch (err) {
    console.warn('Failed to unregister push token', err);
  }
}

export function initForegroundHandler(cb: (payload: any) => void) {
  return onForegroundMessage(cb);
}
import { messaging, requestNotificationPermission } from '../firebase';

// Register FCM token with backend
export async function registerPushToken(userId: string | null) {
  if (!messaging) return null;

  const token = await requestNotificationPermission();
  if (!token) return null;

  // Post token to backend (Supabase function) to associate with user
  try {
    await fetch('/.netlify/functions/register-push-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, userId }),
    });
  } catch (err) {
    console.warn('Failed to register push token with backend:', err);
  }

  return token;
}

export async function refreshPushToken(userId: string | null) {
  // FCM token can be refreshed by calling getToken again via firebase module
  // For now reuse registerPushToken
  return registerPushToken(userId);
}
