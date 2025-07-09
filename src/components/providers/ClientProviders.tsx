'use client';

import { ReactNode, Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import of providers to avoid hydration issues
const SessionProvider = dynamic(() => import('./SessionProvider'), {
  ssr: false,
  loading: () => null
});

const DataProvider = dynamic(() => import('./DataProvider'), {
  ssr: false,
  loading: () => null
});

interface ClientProvidersProps {
  children: ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <Suspense fallback={null}>
      <SessionProvider>
        <DataProvider>
          {children}
        </DataProvider>
      </SessionProvider>
    </Suspense>
  );
}