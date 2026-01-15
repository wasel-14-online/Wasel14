export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('SW registered', registration.scope);
      } catch (err) {
        console.warn('SW registration failed', err);
      }
    });
  }
}

export function promptInstall(handler: (evt: any) => void) {
  let deferredPrompt: any = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    handler(e);
  });
  return () => {
    if (deferredPrompt) deferredPrompt.prompt();
  };
}
