/**
 * Service Worker Registration for BcaFly PWA
 */

export function registerServiceWorker(): void {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('[BcaFly PWA] Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.warn('[BcaFly PWA] Service Worker registration failed:', error);
        });
    });

    // Listen for online status restoration to automatically drain offline attendance queue
    window.addEventListener('online', () => {
      console.log('[BcaFly PWA] Network restored. Synchronizing offline queues...');
      window.dispatchEvent(new CustomEvent('bcafly:network-restored'));
    });
  }
}

export function unregisterServiceWorker(): void {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
