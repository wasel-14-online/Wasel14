import mixpanel from 'mixpanel-browser';

const MIXPANEL_TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN;
const ENVIRONMENT = import.meta.env.MODE;

export function initMixpanel() {
  if (!MIXPANEL_TOKEN || ENVIRONMENT === 'development') {
    return;
  }

  mixpanel.init(MIXPANEL_TOKEN, {
    debug: ENVIRONMENT === 'development',
    track_pageview: true,
    persistence: 'localStorage'
  });
}

export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (ENVIRONMENT === 'development') {
    console.log('Mixpanel Event:', eventName, properties);
    return;
  }

  mixpanel.track(eventName, properties);
}

export function identifyUser(userId: string, properties?: Record<string, any>) {
  if (ENVIRONMENT === 'development') {
    console.log('Mixpanel Identify:', userId, properties);
    return;
  }

  mixpanel.identify(userId);
  if (properties) {
    mixpanel.people.set(properties);
  }
}

export { mixpanel };
