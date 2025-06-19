'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import WorkflowCard from '@/components/workflows/WorkflowCard';
import WorkflowForm from '@/components/forms/WorkflowForm';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useStore } from '@/store/useStore';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function WorkflowsPage() {
  const { workflows, deleteWorkflow } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingWorkflowId, setEditingWorkflowId] = useState<string | null>(null);

  const handleAddWorkflow = () => {
    setEditingWorkflowId(null);
    setShowForm(true);
  };

  const handleEditWorkflow = (workflowId: string) => {
    setEditingWorkflowId(workflowId);
    setShowForm(true);
  };

  const handleDeleteWorkflow = (workflowId: string) => {
    if (window.confirm('Are you sure you want to delete this workflow?')) {
      deleteWorkflow(workflowId);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingWorkflowId(null);
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Workflows</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your QA testing workflows
          </p>
        </div>
        <Button
          onClick={handleAddWorkflow}
          leftIcon={<PlusIcon className="h-5 w-5" />}
        >
          Add Workflow
        </Button>
      </div>

      {showForm && (
        <div className="mb-6">
          <Card title={editingWorkflowId ? 'Edit Workflow' : 'Create New Workflow'}>
            <WorkflowForm
              workflowId={editingWorkflowId || undefined}
              onSuccess={handleFormSuccess}
              onCancel={() => setShowForm(false)}
            />
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {workflows.length > 0 ? (
          workflows.map((workflow) => (
            <WorkflowCard
              key={workflow.id}
              workflow={workflow}
              onEdit={handleEditWorkflow}
              onDelete={handleDeleteWorkflow}
            />
          ))
        ) : (
          <div className="col-span-3 text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No workflows found. Create your first workflow!</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}