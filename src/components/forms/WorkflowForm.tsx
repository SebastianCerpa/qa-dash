import React from 'react';
import { useForm } from 'react-hook-form';
import { useStore, Workflow } from '@/store/useStore';
import Button from '@/components/ui/Button';

interface WorkflowFormProps {
  workflowId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function WorkflowForm({ workflowId, onSuccess, onCancel }: WorkflowFormProps) {
  const { workflows, teamMembers, addWorkflow, updateWorkflow } = useStore();
  
  const existingWorkflow = workflowId ? workflows.find(workflow => workflow.id === workflowId) : undefined;
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: existingWorkflow ? {
      name: existingWorkflow.name,
      description: existingWorkflow.description,
      owner: existingWorkflow.owner,
      collaborators: existingWorkflow.collaborators,
    } : {}
  });

  const onSubmit = async (data: any) => {
    // Ensure all required fields are present and properly typed
    const formattedData: Omit<Workflow, 'id' | 'tasks' | 'createdAt' | 'updatedAt'> = {
      name: data.name || '',
      description: data.description || '',
      owner: data.owner || '',
      collaborators: Array.isArray(data.collaborators) 
        ? data.collaborators 
        : typeof data.collaborators === 'string' 
          ? (data.collaborators as string).split(',').map((id: string) => id.trim()) 
          : [],
    };

    if (existingWorkflow) {
      updateWorkflow(workflowId!, formattedData);
    } else {
      addWorkflow({
        ...formattedData,
        tasks: [],
      });
    }
    
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Workflow Name
        </label>
        <div className="mt-1">
          <input
            id="name"
            type="text"
            {...register('name', { required: 'Workflow name is required' })}
            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message as string}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <div className="mt-1">
          <textarea
            id="description"
            rows={3}
            {...register('description', { required: 'Description is required' })}
            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message as string}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        <div>
          <label htmlFor="owner" className="block text-sm font-medium text-gray-700">
            Owner
          </label>
          <div className="mt-1">
            <select
              id="owner"
              {...register('owner', { required: 'Owner is required' })}
              className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
            >
              <option value="">Select an owner</option>
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
            {errors.owner && (
              <p className="mt-1 text-sm text-red-600">{errors.owner.message as string}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="collaborators" className="block text-sm font-medium text-gray-700">
            Collaborators
          </label>
          <div className="mt-1">
            <select
              id="collaborators"
              multiple
              {...register('collaborators')}
              className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
            >
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple collaborators</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" isLoading={isSubmitting}>
          {existingWorkflow ? 'Update Workflow' : 'Create Workflow'}
        </Button>
      </div>
    </form>
  );
}