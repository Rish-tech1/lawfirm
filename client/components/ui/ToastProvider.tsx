'use client';

import { Toaster } from 'react-hot-toast';

/**
 * Global toast host, styled to the brand rather than the library default.
 *
 * Rendered once in the root layout. `aria-live` handling comes from
 * react-hot-toast, so announcements reach screen readers without extra wiring.
 */
export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      gutter={12}
      toastOptions={{
        duration: 5000,
        className: '',
        style: {
          borderRadius: '2px',
          background: '#111111',
          color: '#ffffff',
          fontSize: '0.875rem',
          lineHeight: '1.5',
          padding: '14px 18px',
          maxWidth: '32rem',
          boxShadow: '0 18px 40px -16px rgba(17,17,17,0.5)',
          border: '1px solid rgba(200,167,91,0.25)',
        },
        success: {
          duration: 7000,
          iconTheme: { primary: '#C8A75B', secondary: '#111111' },
        },
        error: {
          duration: 8000,
          iconTheme: { primary: '#E06C5B', secondary: '#111111' },
        },
      }}
    />
  );
}
