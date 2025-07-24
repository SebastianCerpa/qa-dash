'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import WorkflowCard from '@/components/workflows/WorkflowCard';
import WorkflowForm from '@/components/forms/WorkflowForm';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Workflows
            </h1>
            <p className="mt-2 text-sm text-gray-600 max-w-xl">
              Manage your QA testing workflows to streamline your testing process and improve team collaboration.
            </p>
          </div>
          <Button
            onClick={handleAddWorkflow}
            leftIcon={<PlusIcon className="h-5 w-5" />}
            variant="default"
            className="mt-4 md:mt-0"
          >
            Add Workflow
          </Button>
        </div>
      </div>

      {showForm && (
        <div className="mb-8 transition-all duration-300 animate-fadeIn">
          <Card className="overflow-hidden border border-gray-200 shadow-md">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className="p-1.5 bg-indigo-100 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={editingWorkflowId ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" : "M12 6v6m0 0v6m0-6h6m-6 0H6"} />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{editingWorkflowId ? 'Edit Workflow' : 'Create New Workflow'}</h3>
                    <p className="text-sm text-gray-500 mt-1">{editingWorkflowId ? "Update your workflow information below to modify its properties and settings." : "Create a new workflow to organize your QA tasks and track progress efficiently."}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="bg-indigo-100 text-indigo-700 text-sm font-medium px-2.5 py-0.5 rounded-full">
                    {editingWorkflowId ? 'Editing Mode' : 'Creation Mode'}
                  </div>
                </div>
              </div>
            </div>
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
          <div className="col-span-3 text-center py-16 bg-white rounded-xl shadow-sm border border-dashed border-gray-300 transition-all duration-300 hover:border-indigo-300 hover:bg-indigo-50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="mt-4 text-gray-500 font-medium">No workflows found</p>
            <p className="mt-2 text-gray-400 text-sm">Create your first workflow to get started!</p>
            <Button
              onClick={handleAddWorkflow}
              variant="outline"
              size="sm"
              className="mt-4"
              leftIcon={<PlusIcon className="h-4 w-4" />}
            >
              Add Workflow
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
