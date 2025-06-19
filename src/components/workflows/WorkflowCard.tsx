import React from 'react';
import { Workflow, useStore } from '@/store/useStore';
import Card from '@/components/ui/Card';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';

interface WorkflowCardProps {
  workflow: Workflow;
  onEdit?: (workflowId: string) => void;
  onDelete?: (workflowId: string) => void;
  onAddTask?: (workflowId: string) => void;
}

export default function WorkflowCard({ workflow, onEdit, onDelete, onAddTask }: WorkflowCardProps) {
  const { tasks, teamMembers } = useStore();
  
  const workflowTasks = tasks.filter(task => workflow.tasks.includes(task.id));
  const owner = teamMembers.find(member => member.id === workflow.owner);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getTaskStatusCounts = () => {
    const counts = {
      Todo: 0,
      'In Progress': 0,
      Review: 0,
      Done: 0,
    };

    workflowTasks.forEach(task => {
      counts[task.status] += 1;
    });

    return counts;
  };

  const statusCounts = getTaskStatusCounts();

  return (
    <Card className="h-full flex flex-col">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-medium text-gray-900">{workflow.name}</h3>
        <div className="flex space-x-2">
          {onEdit && (
            <button
              onClick={() => onEdit(workflow.id)}
              className="text-gray-400 hover:text-gray-500"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(workflow.id)}
              className="text-gray-400 hover:text-red-500"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
      
      <p className="mt-2 text-sm text-gray-500">{workflow.description}</p>
      
      <div className="mt-4 grid grid-cols-4 gap-2">
        <div className="bg-gray-100 p-2 rounded text-center">
          <div className="text-lg font-semibold">{statusCounts.Todo}</div>
          <div className="text-xs text-gray-500">Todo</div>
        </div>
        <div className="bg-blue-100 p-2 rounded text-center">
          <div className="text-lg font-semibold">{statusCounts['In Progress']}</div>
          <div className="text-xs text-gray-500">In Progress</div>
        </div>
        <div className="bg-yellow-100 p-2 rounded text-center">
          <div className="text-lg font-semibold">{statusCounts.Review}</div>
          <div className="text-xs text-gray-500">Review</div>
        </div>
        <div className="bg-green-100 p-2 rounded text-center">
          <div className="text-lg font-semibold">{statusCounts.Done}</div>
          <div className="text-xs text-gray-500">Done</div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-gray-900">Owner: {owner?.name || 'Unassigned'}</p>
            <p className="text-xs text-gray-500">Created: {formatDate(workflow.createdAt)}</p>
          </div>
          {onAddTask && (
            <Button 
              size="sm" 
              onClick={() => onAddTask(workflow.id)}
              leftIcon={<PlusIcon className="h-4 w-4" />}
            >
              Add Task
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}