'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useApiStore } from '@/store/apiStore';
import TestPlanForm from '@/components/forms/TestPlanForm';

export default function NewTestPlanPage() {
  const router = useRouter();
  const { addTestPlan, isLoading } = useApiStore();

  const handleSubmit = async (formData: any) => {
    try {
      const newTestPlan = await addTestPlan(formData);
      router.push(`/test-plans/${newTestPlan.id}`);
    } catch (error) {
      console.error('Error creating test plan:', error);
    }
  };

  const handleCancel = () => {
    router.push('/test-plans');
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Create New Test Plan</h1>
      <TestPlanForm 
        onSuccess={handleSubmit} 
        onCancel={handleCancel} 
      />
    </div>
  );
}