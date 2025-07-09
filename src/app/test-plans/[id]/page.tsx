'use client';

import React, { use } from 'react';
import TestPlanDetails from '@/components/test-plans/TestPlanDetails';

interface TestPlanPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function TestPlanPage({ params }: TestPlanPageProps) {
  const { id } = use(params);
  return (
    <div className="container mx-auto py-6">
      <TestPlanDetails testPlanId={id} />
    </div>
  );
}