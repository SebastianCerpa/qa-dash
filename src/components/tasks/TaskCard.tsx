import React from 'react';
import { Task, useStore } from '@/store/useStore';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import {
  PencilIcon,
  TrashIcon,
  ClockIcon,
  UserIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  PauseIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Done':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'In Progress':
        return <PlayIcon className="h-4 w-4" />;
      case 'Todo':
        return <PauseIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done':
        return 'success';
      case 'In Progress':
        return 'default';
      case 'Todo':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
      case 'High':
        return 'destructive';
      case 'Medium':
        return 'warning';
      case 'Low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getTestTypeGradient = (testType: string) => {
    const gradients = {
      'Functional': 'from-blue-500 to-blue-600',
      'Non-functional': 'from-purple-500 to-purple-600',
      'Regression': 'from-orange-500 to-orange-600',
      'API': 'from-green-500 to-green-600',
      'Exploratory': 'from-pink-500 to-pink-600',
      'Boundary': 'from-indigo-500 to-indigo-600',
      'Smoke': 'from-gray-500 to-gray-600',
      'Stress': 'from-red-500 to-red-600',
      'Accessibility': 'from-teal-500 to-teal-600',
      'Positive': 'from-emerald-500 to-emerald-600',
      'Negative': 'from-rose-500 to-rose-600'
    };
    return gradients[testType as keyof typeof gradients] || 'from-slate-500 to-slate-600';
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done';
  const isDueSoon = task.dueDate && new Date(task.dueDate) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) && task.status !== 'Done';

  const getAssigneeInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAssigneeGradient = (name?: string) => {
    if (!name) return 'from-gray-400 to-gray-500';
    const gradients = [
      'from-blue-400 to-blue-500',
      'from-purple-400 to-purple-500',
      'from-green-400 to-green-500',
      'from-orange-400 to-orange-500',
      'from-pink-400 to-pink-500',
      'from-indigo-400 to-indigo-500',
      'from-teal-400 to-teal-500',
      'from-red-400 to-red-500'
    ];
    const index = name.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  return (
    <Card className={cn(
      "group relative h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
      "bg-gradient-to-br from-white to-gray-50/50 border-gray-200/60",
      isOverdue && "shadow-lg shadow-black/20",
      isDueSoon && !isOverdue && "shadow-lg shadow-black/20"
    )}>
      {/* Gradient overlay for visual depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/[0.02] pointer-events-none" />

      {/* Header with title and actions */}
      <CardHeader className="pb-3 relative z-10">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "text-lg font-semibold text-gray-900 truncate leading-tight",
              "group-hover:text-gray-700 transition-colors"
            )}>
              {task.title}
            </h3>
            {/* Test type badge with gradient */}
            <div className="mt-2">
              <div className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white",
                "bg-gradient-to-r shadow-sm",
                getTestTypeGradient(task.testType)
              )}>
                <BeakerIcon className="h-3.5 w-3.5" />
                {task.testType}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {onEdit && (
              <button
                onClick={() => onEdit(task.id)}
                className={cn(
                  "p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50",
                  "transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                )}
                title="Edit task"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(task.id)}
                className={cn(
                  "p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50",
                  "transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                )}
                title="Delete task"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Content with description and badges */}
      <CardContent className="flex-1 pb-3 relative z-10">
        {/* Status and Priority badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge
            variant={getStatusColor(task.status) as any}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium"
          >
            {getStatusIcon(task.status)}
            {task.status}
          </Badge>
          <Badge
            variant={getPriorityColor(task.priority) as any}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium"
          >
            <ExclamationTriangleIcon className="h-3.5 w-3.5" />
            {task.priority}
          </Badge>
        </div>

        {/* Description */}
        <p className={cn(
          "text-sm text-gray-600 leading-relaxed line-clamp-3",
          "group-hover:text-gray-700 transition-colors"
        )}>
          {task.description || 'No description provided'}
        </p>
      </CardContent>

      {/* Footer with assignee and due date */}
      <CardFooter className="pt-3 border-t border-gray-100 relative z-10">
        <div className="flex items-center justify-between w-full">
          {/* Assignee */}
          <div className="flex items-center gap-3">
            <div className={cn(
              "relative flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-semibold",
              "bg-gradient-to-br shadow-sm ring-2 ring-white",
              getAssigneeGradient(assignee?.name)
            )}>
              {getAssigneeInitials(assignee?.name)}
              {/* Online status indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-400 border-2 border-white rounded-full" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {assignee?.name || 'Unassigned'}
              </p>
              <p className="text-xs text-gray-500">
                {assignee?.role || 'Team Member'}
              </p>
            </div>
          </div>

          {/* Due date */}
          <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium",
            "bg-gray-50 text-gray-600 border border-gray-200",
            isOverdue && "bg-blue-50 text-blue-800 border-blue-200",
            isDueSoon && !isOverdue && "bg-slate-50 text-slate-700 border-slate-200"
          )}>
            <CalendarIcon className="h-3.5 w-3.5" />
            <span>{formatDate(task.dueDate)}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
