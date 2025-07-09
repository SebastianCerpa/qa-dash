'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useApiStore } from '@/store/apiStore';
import TestPlanForm from '@/components/forms/TestPlanForm';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EditTestPlanPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditTestPlanPage({ params }: EditTestPlanPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { fetchTestPlanById, updateTestPlan, error } = useApiStore();
  const [testPlan, setTestPlan] = useState<any>(null);
  const [isLoadingTestPlan, setIsLoadingTestPlan] = useState(true);

  useEffect(() => {
    const loadTestPlan = async () => {
      try {
        const plan = await fetchTestPlanById(id);
        setTestPlan(plan);
      } catch (error) {
        console.error('Error loading test plan:', error);
      } finally {
        setIsLoadingTestPlan(false);
      }
    };

    loadTestPlan();
  }, [id, fetchTestPlanById]);

  const handleSubmit = async (formData: any) => {
    try {
      await updateTestPlan(id, formData);
      router.push(`/test-plans/${id}`);
    } catch (error) {
      console.error('Error updating test plan:', error);
    }
  };

  const handleCancel = () => {
    router.push(`/test-plans/${id}`);
  };

  const handleBackToTestPlan = () => {
    router.push(`/test-plans/${id}`);
  };

  if (isLoadingTestPlan) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6 flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6 text-center text-red-500">
          {error}
        </div>
      </DashboardLayout>
    );
  }

  if (!testPlan) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6 text-center text-muted-foreground">
          Test plan not found.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Edit Test Plan</h1>
          <Button
            variant="outline"
            onClick={handleBackToTestPlan}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to test plan
          </Button>
        </div>
        <TestPlanForm
          testPlan={testPlan}
          onSuccess={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </DashboardLayout>
  );
}