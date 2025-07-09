'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApiStore } from '@/store/apiStore';
import TestCaseForm from '@/components/forms/TestCaseForm';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function NewTestCasePage() {
  const router = useRouter();
  const { addTestCase } = useApiStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      const newTestCase = await addTestCase(formData);
      if (newTestCase && newTestCase.id) {
        router.push(`/test-cases/${newTestCase.id}`);
      } else {
        throw new Error('Failed to create test case');
      }
    } catch (error) {
      console.error('Failed to create test case:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/test-cases');
  };

  return (
    <DashboardLayout>
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          className="mr-4" 
          onClick={() => router.push('/test-cases')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Test Cases
        </Button>
        <h1 className="text-2xl font-bold">Create New Test Case</h1>
      </div>
      
      <TestCaseForm 
        onSubmit={handleSubmit} 
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </DashboardLayout>
  );
}