'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function RedirectToNewExecutePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  useEffect(() => {
    if (id) {
      router.push(`/test-cases/${id}/execute`);
    } else {
      router.push('/test-cases');
    }
  }, [id, router]);

  return (
    <div className="flex justify-center items-center h-screen">
      <p className="text-muted-foreground">Redirecting...</p>
    </div>
  );
}