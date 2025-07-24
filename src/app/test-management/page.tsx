import React, { Suspense } from 'react';
import TestManagementClient from './TestManagementClient';

// Disable static generation for this page to prevent prerendering issues
export const dynamic = 'force-dynamic';

// Loading component
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
    </div>
  );
}

// Wrap the main component in Suspense to handle client-side rendering
function TestManagementPageWrapper() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <TestManagementClient />
    </Suspense>
  );
}

export default TestManagementPageWrapper;

