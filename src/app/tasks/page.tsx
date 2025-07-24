'use client';

import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import TaskTable from '@/components/tasks/TaskTable';
import TaskCard from '@/components/tasks/TaskCard';
import TaskForm from '@/components/forms/TaskForm';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useStore } from '@/store/useStore';
import { 
  PlusIcon, 
  ViewColumnsIcon, 
  TableCellsIcon, 
  FunnelIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  PlayIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function TasksPage() {
  const { tasks, deleteTask } = useStore();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showForm, setShowForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [testTypeFilter, setTestTypeFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const handleAddTask = () => {
    setEditingTaskId(null);
    setShowForm(true);
  };

  const handleEditTask = (taskId: string) => {
    setEditingTaskId(taskId);
    setShowForm(true);
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(taskId);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingTaskId(null);
  };

  // Filter and search tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      const matchesTestType = testTypeFilter === 'all' || task.testType === testTypeFilter;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesTestType;
    });
  }, [tasks, searchTerm, statusFilter, priorityFilter, testTypeFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredTasks.length;
    const completed = filteredTasks.filter(task => task.status === 'Done').length;
    const inProgress = filteredTasks.filter(task => task.status === 'In Progress').length;
    const pending = filteredTasks.filter(task => task.status === 'Todo').length;
    const highPriority = filteredTasks.filter(task => task.priority === 'High').length;
    
    return { total, completed, inProgress, pending, highPriority };
  }, [filteredTasks]);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Tasks</h1>
            <p className="text-gray-600">
              Manage and track your QA testing tasks efficiently
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <FunnelIcon className="h-4 w-4" />
              <span>Filters</span>
            </Button>
            <div className="flex rounded-xl shadow-sm border border-gray-200 bg-white">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`relative inline-flex items-center px-4 py-2 rounded-l-xl transition-all duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm' 
                    : 'bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <ViewColumnsIcon className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`relative inline-flex items-center px-4 py-2 rounded-r-xl transition-all duration-200 ${
                  viewMode === 'table' 
                    ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm' 
                    : 'bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <TableCellsIcon className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Table</span>
              </button>
            </div>
            <Button
              onClick={handleAddTask}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <PlayIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-red-600">{stats.highPriority}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            
            {/* Filters */}
            {showFilters && (
              <div className="flex flex-wrap gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="Todo">Todo</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
                
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Priority</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
                
                <select
                  value={testTypeFilter}
                  onChange={(e) => setTestTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Test Types</option>
                  <option value="Positive">Positive</option>
                  <option value="Negative">Negative</option>
                  <option value="Functional">Functional</option>
                  <option value="Non-functional">Non-functional</option>
                  <option value="Regression">Regression</option>
                  <option value="API">API</option>
                  <option value="Exploratory">Exploratory</option>
                  <option value="Boundary">Boundary</option>
                  <option value="Smoke">Smoke</option>
                  <option value="Stress">Stress</option>
                  <option value="Accessibility">Accessibility</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Form */}
      {showForm && (
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingTaskId ? 'Edit Task' : 'Create New Task'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {editingTaskId ? 'Update task details below' : 'Fill in the details to create a new task'}
              </p>
            </div>
            <div className="p-6">
              <TaskForm
                taskId={editingTaskId || undefined}
                onSuccess={handleFormSuccess}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tasks Content */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <TaskTable
            tasks={filteredTasks}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
              />
            ))
          ) : (
            <div className="col-span-full">
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <ChartBarIcon className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || testTypeFilter !== 'all' 
                    ? 'No tasks match your filters' 
                    : 'No tasks found'
                  }
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || testTypeFilter !== 'all'
                    ? 'Try adjusting your search criteria or filters'
                    : 'Create your first task to get started with QA management'
                  }
                </p>
                {(!searchTerm && statusFilter === 'all' && priorityFilter === 'all' && testTypeFilter === 'all') && (
                  <Button
                    onClick={handleAddTask}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Create First Task
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
