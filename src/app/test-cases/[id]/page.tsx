import React from 'react';
import { Metadata } from 'next';
import TestCaseDetails from '@/components/test-cases/TestCaseDetails';
import DashboardLayout from '@/components/layout/DashboardLayout';

export const metadata: Metadata = {
  title: 'Test Case Details | Enhanced QA Dashboard',
  description: 'View and manage test case details',
};

interface TestCasePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TestCasePage({ params }: TestCasePageProps) {
  const { id } = await params;
  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex-1 space-y-4">
          <TestCaseDetails testCaseId={id} />
        </div>
      </div>
    </DashboardLayout>
  );
}