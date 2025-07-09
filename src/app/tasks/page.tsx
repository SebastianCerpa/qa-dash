'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import TaskTable from '@/components/tasks/TaskTable';
import TaskCard from '@/components/tasks/TaskCard';
import TaskForm from '@/components/forms/TaskForm';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useStore } from '@/store/useStore';
import { PlusIcon, ViewColumnsIcon, TableCellsIcon } from '@heroicons/react/24/outline';

export default function TasksPage() {
  const { tasks, deleteTask } = useStore();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [showForm, setShowForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

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

  return (
    <DashboardLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Tasks</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your QA testing tasks
          </p>
        </div>
        <div className="flex space-x-4">
          <div className="flex rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`relative inline-flex items-center px-3 py-2 rounded-l-md border ${viewMode === 'table' ? 'bg-primary-50 border-primary-500 text-primary-600' : 'bg-white border-gray-300 text-gray-500'}`}
            >
              <TableCellsIcon className="h-5 w-5" />
              <span className="sr-only">Table view</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`relative inline-flex items-center px-3 py-2 rounded-r-md border ${viewMode === 'grid' ? 'bg-primary-50 border-primary-500 text-primary-600' : 'bg-white border-gray-300 text-gray-500'}`}
            >
              <ViewColumnsIcon className="h-5 w-5" />
              <span className="sr-only">Grid view</span>
            </button>
          </div>
          <Button
            onClick={handleAddTask}
            leftIcon={<PlusIcon className="h-5 w-5" />}
          >
            Add Task
          </Button>
        </div>
      </div>

      {showForm && (
        <div className="mb-6">
          <Card title={editingTaskId ? 'Edit Task' : 'Create New Task'}>
            <TaskForm
              taskId={editingTaskId || undefined}
              onSuccess={handleFormSuccess}
              onCancel={() => setShowForm(false)}
            />
          </Card>
        </div>
      )}

      {viewMode === 'table' ? (
        <TaskTable
          tasks={tasks}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
              />
            ))
          ) : (
            <div className="col-span-3 text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">No tasks found. Create your first task!</p>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}