'use client';

import React, { use } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import TestPlanDetails from '@/components/test-plans/TestPlanDetails';

interface TestPlanPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function TestPlanPage({ params }: TestPlanPageProps) {
  const { id } = use(params);
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <TestPlanDetails testPlanId={id} />
      </div>
    </DashboardLayout>
  );
}