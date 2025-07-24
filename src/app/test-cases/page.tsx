import React from 'react';
import { Metadata } from 'next';
import TestCasesList from '@/components/test-cases/TestCasesList';
import DashboardLayout from '@/components/layout/DashboardLayout';

export const metadata: Metadata = {
  title: 'Test Cases | Enhanced QA Pandash',
  description: 'Manage and execute test cases for your projects',
};

export default function TestCasesPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex-1 space-y-4">
          <TestCasesList />
        </div>
      </div>
    </DashboardLayout>
  );
}
