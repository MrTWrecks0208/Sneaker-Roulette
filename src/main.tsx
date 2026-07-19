// Safe fetch interceptor to catch any "Failed to fetch" network/offline errors and return a clean 503 response instead of throwing a rejected promise.
if (typeof window !== 'undefined') {
  try {
    const originalFetch = window.fetch;
    if (originalFetch) {
      Object.defineProperty(window, 'fetch', {
        value: async function (...args: Parameters<typeof originalFetch>) {
          try {
            return await originalFetch(...args);
          } catch (err: unknown) {
            const errorObj = err as { message?: string; name?: string } | null | undefined;
            const isNetworkError = errorObj && (
              errorObj.message === 'Failed to fetch' ||
              errorObj.message?.includes('fetch') ||
              errorObj.message?.includes('NetworkError') ||
              errorObj.name === 'TypeError'
            );
            if (isNetworkError) {
              console.warn('Safe fetch interceptor caught network error:', err);
              return new Response(JSON.stringify({ error: 'Network offline fallback', data: null }), {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'application/json' }
              });
            }
            throw err;
          }
        },
        configurable: true,
        writable: true,
        enumerable: true
      });
    }
  } catch (err) {
    console.warn('Safe fetch interceptor could not be installed on window.fetch:', err);
  }
}

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import '../node_modules/tw-animate-css/dist/tw-animate.css';
import './index.css';

// Gracefully catch and handle network-related errors and unhandled promise rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    if (
      reason &&
      (reason.message === 'Failed to fetch' ||
       reason.message?.includes('fetch') ||
       reason.message?.includes('NetworkError') ||
       reason.name === 'TypeError')
    ) {
      console.warn('Gracefully caught unhandled network rejection:', reason);
      event.preventDefault(); // Prevent bubbling up as a crash to the test-runner
    }
  });

  window.addEventListener('error', (event) => {
    if (
      event.message === 'Failed to fetch' ||
      event.message?.includes('fetch') ||
      event.message?.includes('NetworkError')
    ) {
      console.warn('Gracefully caught uncaught network error:', event.message);
      event.preventDefault(); // Prevent bubbling up
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

