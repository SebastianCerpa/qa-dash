import React from 'react';
import { Task, useStore } from '@/store/useStore';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface TaskCardProps {
  task: Task;
  onEdit?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
}

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const { teamMembers } = useStore();
  
  const assignee = teamMembers.find(member => member.id === task.assignee);
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className="h-full flex flex-col">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-medium text-gray-900 truncate">{task.title}</h3>
        <div className="flex space-x-2">
          {onEdit && (
            <button
              onClick={() => onEdit(task.id)}
              className="text-gray-400 hover:text-gray-500"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(task.id)}
              className="text-gray-400 hover:text-red-500"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
      
      <div className="mt-2 flex flex-wrap gap-2">
        <Badge label={task.testType} variant="testType" />
        <Badge label={task.status} variant="status" />
        <Badge label={task.priority} variant="priority" />
      </div>
      
      <p className="mt-3 text-sm text-gray-500 line-clamp-3">{task.description}</p>
      
      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
            {assignee?.name?.charAt(0) || '?'}
          </div>
          <div className="ml-2">
            <p className="text-sm font-medium text-gray-900">{assignee?.name || 'Unassigned'}</p>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          Due: {formatDate(task.dueDate)}
        </div>
      </div>
    </Card>
  );
}