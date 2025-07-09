'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApiStore } from '@/store/apiStore';
import TestCaseForm from '@/components/forms/TestCaseForm';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function EditTestCasePage() {
  const params = useParams();
  const router = useRouter();
  const { fetchTestCase, updateTestCase, testCase, isLoading, error } = useApiStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const id = params?.id as string;

  useEffect(() => {
    if (id) {
      fetchTestCase(id);
    }
  }, [id, fetchTestCase]);

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      await updateTestCase(id, formData);
      router.push(`/test-cases/${id}`);
    } catch (error) {
      console.error('Failed to update test case:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/test-cases/${id}`);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Loading test case...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !testCase) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <p className="text-destructive">Error loading test case: {error || 'Test case not found'}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          className="mr-4" 
          onClick={() => router.push(`/test-cases/${id}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Test Case
        </Button>
        <h1 className="text-2xl font-bold">Edit Test Case</h1>
      </div>
      
      <TestCaseForm 
        initialData={testCase} 
        onSubmit={handleSubmit} 
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </DashboardLayout>
  );
}