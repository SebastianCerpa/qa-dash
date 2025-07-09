'use client';

import { useSession } from 'next-auth/react';

export default function SessionDebug() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">Loading session...</div>;
  }

  return (
    <div className="p-4 bg-blue-100 border border-blue-400 rounded mb-4">
      <h3 className="font-bold mb-2">Session Debug Info:</h3>
      <p><strong>Status:</strong> {status}</p>
      <p><strong>User:</strong> {session?.user?.email || 'Not authenticated'}</p>
      <p><strong>User ID:</strong> {session?.user?.id || 'N/A'}</p>
      <p><strong>User Role:</strong> {session?.user?.role || 'N/A'}</p>
      <details className="mt-2">
        <summary className="cursor-pointer font-medium">Full Session Data</summary>
        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
          {JSON.stringify(session, null, 2)}
        </pre>
      </details>
    </div>
  );
}