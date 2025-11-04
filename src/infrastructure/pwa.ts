export function registerPWA(): void {
  if ('serviceWorker' in navigator) {
    // In dev and prod, Vite will serve from /public
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .catch((err) => console.warn('SW registration failed:', err));
    });
  }
}

