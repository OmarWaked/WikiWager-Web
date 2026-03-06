'use client';

import { Toaster } from 'sonner';

export function Toast() {
  return (
    <Toaster
      theme="dark"
      position="top-center"
      toastOptions={{
        style: {
          background: 'rgba(26, 31, 53, 0.9)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(124, 58, 237, 0.2)',
          color: '#F0F0F5',
        },
      }}
    />
  );
}
