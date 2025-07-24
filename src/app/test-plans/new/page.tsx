'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useApiStore } from '@/store/apiStore';
import DashboardLayout from '@/components/layout/DashboardLayout';
import TestPlanForm from '@/components/forms/TestPlanForm';
import SessionDebug from '@/components/debug/SessionDebug';

export default function NewTestPlanPage() {
  const router = useRouter();
  const { addTestPlan, isLoading } = useApiStore();

  const handleSubmit = async (testPlan: any) => {
    try {
      console.log('NewTestPlanPage: handleSubmit called with:', testPlan);
      if (testPlan && testPlan.id) {
        console.log('NewTestPlanPage: Navigating to test plan:', testPlan.id);
        router.push(`/test-plans/${testPlan.id}`);
      } else {
        console.error('NewTestPlanPage: Test plan created but no ID returned:', testPlan);
        // Fallback to test plans list
        router.push('/test-plans');
      }
    } catch (error) {
      console.error('NewTestPlanPage: Error in handleSubmit:', error);
    }
  };

  const handleCancel = () => {
    router.push('/test-plans');
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Create New Test Plan</h1>
        <SessionDebug />
        <TestPlanForm 
          onSuccess={handleSubmit} 
          onCancel={handleCancel} 
        />
      </div>
    </DashboardLayout>
  );
}
