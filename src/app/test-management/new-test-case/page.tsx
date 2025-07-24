'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectToNewTestCasePage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/test-cases/new');
  }, [router]);

  return (
    <div className="flex justify-center items-center h-screen">
      <p className="text-muted-foreground">Redirecting...</p>
    </div>
  );
}
