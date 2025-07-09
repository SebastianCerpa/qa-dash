import React from 'react';
import { Workflow, useStore } from '@/store/useStore';
import { Card } from '@/components/ui/card';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';

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
      Done: 0,
    };

    workflowTasks.forEach(task => {
      if (task && task.status) {
        counts[task.status] = (counts[task.status] || 0) + 1;
      }
    });

    return counts;
  };

  const statusCounts = getTaskStatusCounts();
  const totalTasks = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
  const completionPercentage = totalTasks > 0 ? Math.round((statusCounts.Done / totalTasks) * 100) : 0;

  // Function to determine the color scheme based on completion percentage
  const getColorScheme = () => {
    if (completionPercentage >= 75) return {
      gradient: 'from-green-400 to-emerald-500',
      accent: 'bg-emerald-500',
      light: 'bg-green-50',
      border: 'border-green-100',
      text: 'text-emerald-700'
    };
    if (completionPercentage >= 50) return {
      gradient: 'from-blue-400 to-cyan-500',
      accent: 'bg-blue-500',
      light: 'bg-blue-50',
      border: 'border-blue-100',
      text: 'text-blue-700'
    };
    if (completionPercentage >= 25) return {
      gradient: 'from-yellow-400 to-amber-500',
      accent: 'bg-amber-500',
      light: 'bg-amber-50',
      border: 'border-amber-100',
      text: 'text-amber-700'
    };
    return {
      gradient: 'from-indigo-400 to-purple-500',
      accent: 'bg-indigo-500',
      light: 'bg-indigo-50',
      border: 'border-indigo-100',
      text: 'text-indigo-700'
    };
  };

  const colorScheme = getColorScheme();

  return (
    <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:translate-y-[-4px] border border-gray-200 shadow-md">
      {/* Colored top bar based on completion percentage */}
      <div className="h-2 w-full bg-gray-100">
        <div
          className={`h-full bg-gradient-to-r ${colorScheme.gradient}`}
          style={{ width: `${completionPercentage}%` }}
        ></div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900 transition-colors flex items-center">
              {workflow.name}
              {totalTasks > 0 && (
                <span className={`ml-2 text-sm font-medium text-white ${colorScheme.accent} px-2 py-0.5 rounded-full`}>
                  {completionPercentage}%
                </span>
              )}
            </h3>
            <p className="mt-1.5 text-sm text-gray-500 line-clamp-2">{workflow.description}</p>
          </div>
          <div className="flex space-x-1">
            {onEdit && (
              <button
                onClick={() => onEdit(workflow.id)}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                aria-label="Edit workflow"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(workflow.id)}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                aria-label="Delete workflow"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Task count and progress */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full ${colorScheme.light} ${colorScheme.text} flex items-center justify-center text-sm font-medium`}>
              {totalTasks}
            </div>
            <span className="ml-2 text-sm text-gray-600">
              {totalTasks === 1 ? 'task' : 'tasks'}
            </span>
          </div>
        </div>

        {/* Task status counts */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-50 rounded-xl p-3 text-center transition-all duration-200 hover:shadow-sm">
            <div className="text-xl font-semibold text-gray-700">{statusCounts.Todo}</div>
            <div className="text-sm font-medium text-gray-500 mt-1">Todo</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 text-center transition-all duration-200 hover:shadow-sm">
            <div className="text-xl font-semibold text-blue-700">{statusCounts['In Progress']}</div>
            <div className="text-sm font-medium text-gray-500 mt-1">In Progress</div>
          </div>
          <div className="bg-green-50 rounded-xl p-3 text-center transition-all duration-200 hover:shadow-sm">
            <div className="text-xl font-semibold text-green-700">{statusCounts.Done}</div>
            <div className="text-sm font-medium text-gray-500 mt-1">Done</div>
          </div>
        </div>
      </div>

      {/* Footer with owner info and add task button */}
      <div className="mt-auto p-5 pt-4 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full ${colorScheme.light} ${colorScheme.text} flex items-center justify-center text-sm font-medium shadow-sm`}>
              {owner?.name?.charAt(0) || 'U'}
            </div>
            <div className="ml-2">
              <p className="text-sm font-medium text-gray-900">{owner?.name || 'Unassigned'}</p>
              <p className="text-sm text-gray-500">{formatDate(workflow.createdAt)}</p>
            </div>
          </div>
          {onAddTask && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onAddTask(workflow.id)}
              leftIcon={<PlusIcon className="h-4 w-4" />}
              className="shadow-sm"
            >
              Add Task
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}