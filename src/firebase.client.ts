import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import env, { requireEnv } from './config';

// Initialize firebase only once
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

if (!getApps().length && env.VITE_FIREBASE_PROJECT_ID) {
  initializeApp(firebaseConfig);
}

export const messagingAvailable = !!env.VITE_FIREBASE_VAPID_KEY && !!env.VITE_FIREBASE_PROJECT_ID;

export async function requestPushPermissionAndGetToken(): Promise<string | null> {
  if (!messagingAvailable) return null;
  try {
    const messaging = getMessaging();
    const vapidKey = requireEnv('VITE_FIREBASE_VAPID_KEY');
    const token = await getToken(messaging as any, { vapidKey });
    return token || null;
  } catch (err) {
    console.warn('FCM token fetch failed', err);
    return null;
  }
}

export function onForegroundMessage(cb: (payload: any) => void) {
  try {
    const messaging = getMessaging();
    return onMessage(messaging as any, (payload) => cb(payload));
  } catch (err) {
    console.warn('onMessage not available', err);
    return () => {};
  }
}
