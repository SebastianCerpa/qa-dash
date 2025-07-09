import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useStore, Workflow } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import UserSelector from '@/components/tickets/UserSelector';

interface WorkflowFormData {
  name?: string;
  description?: string;
  owner?: string;
  collaborators?: string[] | string;
}

interface WorkflowFormProps {
  workflowId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function WorkflowForm({ workflowId, onSuccess, onCancel }: WorkflowFormProps) {
  const { workflows, teamMembers, addWorkflow, updateWorkflow } = useStore();
  
  const existingWorkflow = workflowId ? workflows.find(workflow => workflow.id === workflowId) : undefined;
  
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm({
    defaultValues: existingWorkflow ? {
      name: existingWorkflow.name,
      description: existingWorkflow.description,
      owner: existingWorkflow.owner,
      collaborators: existingWorkflow.collaborators,
    } : {}
  });

  const onSubmit = async (data: WorkflowFormData) => {
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">


      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="mb-6">
          <label htmlFor="name" className="block mb-2">
            <div className="flex items-center">
              <div className="bg-indigo-100 p-1.5 rounded-md mr-2 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <span className="font-semibold text-sm text-gray-800">Workflow Name</span>
              <span className="text-red-500 ml-1">*</span>
            </div>
            <span className="text-sm text-gray-500 ml-8 mt-1 block">Enter a unique name for your workflow</span>
          </label>
          <div className="mt-1">
            <div className="relative">
              <input
                id="name"
                type="text"
                placeholder="Enter workflow name"
                {...register('name', { required: 'Workflow name is required' })}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full text-sm border-gray-300 rounded-lg py-3 pl-4 pr-12 transition-all duration-200 hover:border-indigo-300 bg-white bg-opacity-90 backdrop-blur-sm"
                style={{ backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.8), rgba(249, 250, 251, 0.8))' }}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <div className="text-indigo-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
            {errors.name && (
              <p className="mt-2 text-sm text-red-600 flex items-center bg-red-50 p-2 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{errors.name.message as string}</span>
              </p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="description" className="block mb-2">
            <div className="flex items-center">
              <div className="bg-indigo-100 p-1.5 rounded-md mr-2 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
              </div>
              <span className="font-semibold text-sm text-gray-800">Description</span>
              <span className="text-red-500 ml-1">*</span>
            </div>
            <span className="text-sm text-gray-500 ml-8 mt-1 block">Provide details about the workflow's purpose and goals</span>
          </label>
          <div className="mt-1">
            <div className="relative">
              <textarea
                id="description"
                rows={4}
                placeholder="Describe the purpose of this workflow"
                {...register('description', { required: 'Description is required' })}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full text-sm border-gray-300 rounded-lg py-3 px-4 transition-all duration-200 hover:border-indigo-300 bg-white bg-opacity-90 backdrop-blur-sm"
                style={{ backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.8), rgba(249, 250, 251, 0.8))' }}
              />
              <div className="absolute top-3 right-3 pointer-events-none">
                <div className="text-indigo-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                </div>
              </div>
            </div>
            {errors.description && (
              <p className="mt-2 text-sm text-red-600 flex items-center bg-red-50 p-2 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{errors.description.message as string}</span>
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-y-6 gap-x-8 sm:grid-cols-2">
          <div>
            <label htmlFor="owner" className="block mb-2">
              <div className="flex items-center">
                <div className="bg-indigo-100 p-1.5 rounded-md mr-2 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="font-semibold text-sm text-gray-800">Owner</span>
                <span className="text-red-500 ml-1">*</span>
              </div>
              <span className="text-sm text-gray-500 ml-8 mt-1 block">Select the person responsible for this workflow</span>
            </label>
            <div className="mt-1 relative">
              <Controller
                name="owner"
                control={control}
                rules={{ required: 'Owner is required' }}
                render={({ field, fieldState: { error } }) => (
                  <>
                    <UserSelector
                      control={control}
                      name="owner"
                      label=""
                      required={true}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full text-sm border-gray-300 rounded-lg transition-all duration-200 hover:border-indigo-300 bg-white bg-opacity-90 backdrop-blur-sm"
                    />
                    {error && (
                      <p className="mt-2 text-sm text-red-600 flex items-center bg-red-50 p-2 rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>{error.message as string}</span>
                      </p>
                    )}
                  </>
                )}
              />
            </div>
          </div>

          <div>
            <label htmlFor="collaborators" className="block mb-2">
              <div className="flex items-center">
                <div className="bg-indigo-100 p-1.5 rounded-md mr-2 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <span className="font-semibold text-sm text-gray-800">Collaborators</span>
              </div>
              <span className="text-sm text-gray-500 ml-8 mt-1 block">Select team members who will work on this workflow</span>
            </label>
            <div className="mt-1">
              <div className="relative">
                <Controller
                  name="collaborators"
                  control={control}
                  render={({ field }) => (
                    <UserSelector
                      control={control}
                      name="collaborators"
                      label=""
                      required={false}
                      isMulti={true}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full text-sm border-gray-300 rounded-lg transition-all duration-200 hover:border-indigo-300 bg-white bg-opacity-90 backdrop-blur-sm"
                    />
                  )}
                />
              </div>
              <p className="mt-2 text-sm text-gray-600 flex items-center bg-indigo-50 p-2.5 rounded-md border border-indigo-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Puedes seleccionar múltiples colaboradores</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500 italic">
            {existingWorkflow ? 'Last updated: Today' : 'All fields marked with * are required'}
          </div>
          
          <div className="flex space-x-4">
            {onCancel && (
              <Button 
                variant="outline" 
                onClick={onCancel} 
                className="shadow-sm px-6 py-2.5 border-2 hover:bg-gray-50 transition-all duration-300"
                leftIcon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                }
              >
                Cancel
              </Button>
            )}
            <Button 
              type="submit" 
              isLoading={isSubmitting} 
              variant="default" 
              className="shadow-md px-6 py-2.5 transition-all duration-300 hover:shadow-lg"
              leftIcon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={existingWorkflow ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"} />
                </svg>
              }
            >
              {existingWorkflow ? 'Update Workflow' : 'Create Workflow'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}