import React, { useState } from 'react';
import { Task, useStore } from '@/store/useStore';
import { Badge } from '@/components/ui/badge';
import { 
  PencilIcon, 
  TrashIcon, 
  EyeIcon, 
  ChevronUpIcon, 
  ChevronDownIcon,
  UserIcon,
  CalendarIcon,
  CheckCircleIcon,
  PlayIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface TaskTableProps {
  tasks: Task[];
  onView?: (taskId: string) => void;
  onEdit?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
}

export default function TaskTable({ tasks, onView, onEdit, onDelete }: TaskTableProps) {
  const { teamMembers } = useStore();
  const [sortField, setSortField] = useState<keyof Task>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: keyof Task) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    const valueA = a[sortField];
    const valueB = b[sortField];
  
    if (sortField === 'dueDate') {
      const dateA = valueA ? new Date(valueA as string).getTime() : 0;
      const dateB = valueB ? new Date(valueB as string).getTime() : 0;
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    }
  
    // Convert both values to string for safe comparison
    const stringA = valueA ? String(valueA).toLowerCase() : '';
    const stringB = valueB ? String(valueB).toLowerCase() : '';
  
    if (stringA < stringB) return sortDirection === 'asc' ? -1 : 1;
    if (stringA > stringB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
  

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const getAssigneeName = (assigneeId: string) => {
    const assignee = teamMembers.find(member => member.id === assigneeId);
    return assignee?.name || 'Unassigned';
  };

  const getAssignee = (assigneeId: string) => {
    return teamMembers.find(member => member.id === assigneeId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'In Progress':
        return <PlayIcon className="w-4 h-4 text-blue-500" />;
      case 'Pending':
        return <ClockIcon className="w-4 h-4 text-yellow-500" />;
      default:
        return <ExclamationTriangleIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTestTypeGradient = (testType: string) => {
    switch (testType) {
      case 'Unit':
        return 'from-blue-500 to-cyan-500';
      case 'Integration':
        return 'from-purple-500 to-pink-500';
      case 'E2E':
        return 'from-green-500 to-emerald-500';
      case 'Performance':
        return 'from-orange-500 to-red-500';
      default:
        return 'from-gray-500 to-slate-500';
    }
  };

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <th
                scope="col"
                className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                onClick={() => handleSort('title')}
              >
                <div className="flex items-center space-x-1">
                  <span>Title</span>
                  {sortField === 'title' ? (
                    sortDirection === 'asc' ? (
                      <ChevronUpIcon className="w-4 h-4 text-blue-500" />
                    ) : (
                      <ChevronDownIcon className="w-4 h-4 text-blue-500" />
                    )
                  ) : (
                    <ChevronUpIcon className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                onClick={() => handleSort('testType')}
              >
                <div className="flex items-center space-x-1">
                  <span>Test Type</span>
                  {sortField === 'testType' ? (
                    sortDirection === 'asc' ? (
                      <ChevronUpIcon className="w-4 h-4 text-blue-500" />
                    ) : (
                      <ChevronDownIcon className="w-4 h-4 text-blue-500" />
                    )
                  ) : (
                    <ChevronUpIcon className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center space-x-1">
                  <span>Status</span>
                  {sortField === 'status' ? (
                    sortDirection === 'asc' ? (
                      <ChevronUpIcon className="w-4 h-4 text-blue-500" />
                    ) : (
                      <ChevronDownIcon className="w-4 h-4 text-blue-500" />
                    )
                  ) : (
                    <ChevronUpIcon className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                onClick={() => handleSort('priority')}
              >
                <div className="flex items-center space-x-1">
                  <span>Priority</span>
                  {sortField === 'priority' ? (
                    sortDirection === 'asc' ? (
                      <ChevronUpIcon className="w-4 h-4 text-blue-500" />
                    ) : (
                      <ChevronDownIcon className="w-4 h-4 text-blue-500" />
                    )
                  ) : (
                    <ChevronUpIcon className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                onClick={() => handleSort('assignee')}
              >
                <div className="flex items-center space-x-1">
                  <span>Assignee</span>
                  {sortField === 'assignee' ? (
                    sortDirection === 'asc' ? (
                      <ChevronUpIcon className="w-4 h-4 text-blue-500" />
                    ) : (
                      <ChevronDownIcon className="w-4 h-4 text-blue-500" />
                    )
                  ) : (
                    <ChevronUpIcon className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                onClick={() => handleSort('dueDate')}
              >
                <div className="flex items-center space-x-1">
                  <span>Due Date</span>
                  {sortField === 'dueDate' ? (
                    sortDirection === 'asc' ? (
                      <ChevronUpIcon className="w-4 h-4 text-blue-500" />
                    ) : (
                      <ChevronDownIcon className="w-4 h-4 text-blue-500" />
                    )
                  ) : (
                    <ChevronUpIcon className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </th>
              <th scope="col" className="px-6 py-4 text-right text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {sortedTasks.map((task, index) => {
              const assignee = getAssignee(task.assignee);
              return (
                <tr 
                  key={task.id} 
                  className={`hover:bg-gray-50 transition-colors group ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(task.status)}
                      <div>
                        <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {task.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                          {task.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getTestTypeGradient(task.testType)} text-white shadow-sm`}>
                      {task.testType}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(task.status)}
                      <span className="text-sm font-medium text-gray-700">{task.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge 
                      variant={task.priority === 'High' ? 'destructive' : task.priority === 'Medium' ? 'warning' : 'success'}
                      size="sm"
                      className="shadow-sm"
                    >
                      {task.priority}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        {assignee?.image ? (
                          <img
                            src={assignee.image}
                            alt={assignee.name}
                            className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm"
                          />
                        ) : (
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getTestTypeGradient(task.testType)} flex items-center justify-center text-white text-sm font-semibold shadow-sm`}>
                            {assignee?.name?.charAt(0) || <UserIcon className="w-4 h-4" />}
                          </div>
                        )}
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{assignee?.name || 'Unassigned'}</div>
                        <div className="text-xs text-gray-500">{assignee?.role || 'Team Member'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CalendarIcon className="w-4 h-4 text-gray-400" />
                      <span>{formatDate(task.dueDate)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {onView && (
                        <button
                          onClick={() => onView(task.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          title="View task"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      )}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(task.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          title="Edit task"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(task.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                          title="Delete task"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}