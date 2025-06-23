'use client';

import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useEnhancedQAStore, Sprint } from '@/store/enhancedStore';
import {
  PlusIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ChartBarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface SprintFormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  goals: string[];
  status: 'Planning' | 'Active' | 'Completed' | 'Cancelled';
}

function SprintForm({ 
  sprint, 
  onSuccess, 
  onCancel 
}: { 
  sprint?: Sprint; 
  onSuccess: () => void; 
  onCancel: () => void; 
}) {
  const { addSprint, updateSprint } = useEnhancedQAStore();
  const [formData, setFormData] = useState<SprintFormData>({
    name: sprint?.name || '',
    description: sprint?.description || '',
    startDate: sprint?.startDate ? new Date(sprint.startDate).toISOString().split('T')[0] : '',
    endDate: sprint?.endDate ? new Date(sprint.endDate).toISOString().split('T')[0] : '',
    goals: sprint?.goals || [''],
    status: sprint?.status || 'Planning'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  
    const sprintData: Omit<Sprint, 'id'> = {
      ...formData,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      goals: formData.goals.filter(goal => goal.trim() !== ''),
      specifications: [],
      ticketIds: [],
      velocity: 0,
      burndownData: [],
    };
  
    if (sprint) {
      updateSprint(sprint.id, sprintData);
    } else {
      addSprint(sprintData);
    }
  
    onSuccess();
  };
  

  const addGoal = () => {
    setFormData(prev => ({ ...prev, goals: [...prev.goals, ''] }));
  };

  const updateGoal = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.map((goal, i) => i === index ? value : goal)
    }));
  };

  const removeGoal = (index: number) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sprint Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'Planning' | 'Active' | 'Completed' | 'Cancelled' }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="Planning">Planning</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date *
          </label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date *
          </label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Sprint Goals
          </label>
          <Button type="button" variant="outline" size="sm" onClick={addGoal}>
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Goal
          </Button>
        </div>
        <div className="space-y-2">
          {formData.goals.map((goal, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={goal}
                onChange={(e) => updateGoal(index, e.target.value)}
                placeholder={`Goal ${index + 1}`}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {formData.goals.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeGoal(index)}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {sprint ? 'Update Sprint' : 'Create Sprint'}
        </Button>
      </div>
    </form>
  );
}

function SprintCard({ sprint, onEdit, onDelete, onView }: {
  sprint: Sprint;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}) {
  const { tickets } = useEnhancedQAStore();
  
  const sprintTickets = tickets.filter(ticket => ticket.sprintId === sprint.id);
  const completedTickets = sprintTickets.filter(ticket => ticket.status === 'Closed');
  const progress = sprintTickets.length > 0 ? (completedTickets.length / sprintTickets.length) * 100 : 0;
  
  const now = new Date();
  const startDate = new Date(sprint.startDate);
  const endDate = new Date(sprint.endDate);
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysElapsed = Math.max(0, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const timeProgress = Math.min(100, (daysElapsed / totalDays) * 100);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planning': return 'bg-gray-100 text-gray-800';
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{sprint.name}</h3>
            <Badge className={getStatusColor(sprint.status)} label={sprint.status} />

          </div>
          <div className="flex space-x-2">
            <Button variant='primary' size="sm" onClick={() => onView(sprint.id)}>
              <EyeIcon className="h-4 w-4" />
            </Button>
            <Button variant='primary' size="sm" onClick={() => onEdit(sprint.id)}>
              <PencilIcon className="h-4 w-4" />
            </Button>
            <Button variant='primary' size="sm" onClick={() => onDelete(sprint.id)}>
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {sprint.description && (
          <p className="text-gray-600 mb-4 text-sm">{sprint.description}</p>
        )}

        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <CalendarIcon className="h-4 w-4 mr-2" />
            {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <DocumentTextIcon className="h-4 w-4 mr-2" />
            {sprintTickets.length} tickets
          </div>
        </div>

        {/* Progress Bars */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Ticket Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Time Progress</span>
              <span>{Math.round(timeProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${timeProgress}%` }}
              />
            </div>
          </div>
        </div>

        {sprint.goals.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Goals:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {sprint.goals.slice(0, 3).map((goal, index) => (
                <li key={index} className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                  {goal}
                </li>
              ))}
              {sprint.goals.length > 3 && (
                <li className="text-gray-400">+{sprint.goals.length - 3} more goals</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}

export default function SprintsPage() {
  const { sprints, deleteSprint } = useEnhancedQAStore();
  const [showForm, setShowForm] = useState(false);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');

  const sortedSprints = useMemo(() => {
    return [...sprints].sort((a, b) => {
      // Active sprints first, then by start date
      if (a.status === 'Active' && b.status !== 'Active') return -1;
      if (b.status === 'Active' && a.status !== 'Active') return 1;
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });
  }, [sprints]);

  const handleAddSprint = () => {
    setEditingSprint(null);
    setShowForm(true);
  };

  const handleEditSprint = (sprintId: string) => {
    const sprint = sprints.find(s => s.id === sprintId);
    setEditingSprint(sprint || null);
    setShowForm(true);
  };

  const handleDeleteSprint = (sprintId: string) => {
    if (window.confirm('Are you sure you want to delete this sprint? This action cannot be undone.')) {
      deleteSprint(sprintId);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingSprint(null);
  };

  const activeSprints = sprints.filter(s => s.status === 'Active');
  const planningSprints = sprints.filter(s => s.status === 'Planning');
  const completedSprints = sprints.filter(s => s.status === 'Completed');

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Sprint Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Plan, track, and manage development sprints with timeline visualization
            </p>
          </div>
          <Button
            onClick={handleAddSprint}
            leftIcon={<PlusIcon className="h-5 w-5" />}
          >
            Create Sprint
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <div className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Active Sprints</p>
                  <p className="text-2xl font-semibold text-gray-900">{activeSprints.length}</p>
                </div>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Planning</p>
                  <p className="text-2xl font-semibold text-gray-900">{planningSprints.length}</p>
                </div>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DocumentTextIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Completed</p>
                  <p className="text-2xl font-semibold text-gray-900">{completedSprints.length}</p>
                </div>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserGroupIcon className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Sprints</p>
                  <p className="text-2xl font-semibold text-gray-900">{sprints.length}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* View Toggle */}
        <div className="flex space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'outline'}
            onClick={() => setViewMode('grid')}
            size="sm"
          >
            Grid View
          </Button>
          <Button
            variant={viewMode === 'timeline' ? 'primary' : 'outline'}
            onClick={() => setViewMode('timeline')}
            size="sm"
          >
            Timeline View
          </Button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-6">
          <Card title={editingSprint ? 'Edit Sprint' : 'Create New Sprint'}>
            <SprintForm
              sprint={editingSprint || undefined}
              onSuccess={handleFormSuccess}
              onCancel={() => setShowForm(false)}
            />
          </Card>
        </div>
      )}

      {/* Content */}
      {viewMode === 'grid' ? (
        <div className="space-y-6">
          {/* Active Sprints */}
          {activeSprints.length > 0 && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Active Sprints</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeSprints.map((sprint) => (
                  <SprintCard
                    key={sprint.id}
                    sprint={sprint}
                    onEdit={handleEditSprint}
                    onDelete={handleDeleteSprint}
                    onView={handleEditSprint}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Planning Sprints */}
          {planningSprints.length > 0 && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Planning Sprints</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {planningSprints.map((sprint) => (
                  <SprintCard
                    key={sprint.id}
                    sprint={sprint}
                    onEdit={handleEditSprint}
                    onDelete={handleDeleteSprint}
                    onView={handleEditSprint}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed Sprints */}
          {completedSprints.length > 0 && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Completed Sprints</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedSprints.map((sprint) => (
                  <SprintCard
                    key={sprint.id}
                    sprint={sprint}
                    onEdit={handleEditSprint}
                    onDelete={handleDeleteSprint}
                    onView={handleEditSprint}
                  />
                ))}
              </div>
            </div>
          )}

          {sprints.length === 0 && (
            <div className="text-center py-12">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No sprints</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first sprint.</p>
              <div className="mt-6">
                <Button onClick={handleAddSprint}>
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Create Sprint
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Timeline View */
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Sprint Timeline</h3>
            <div className="space-y-4">
              {sortedSprints.map((sprint) => {
                const startDate = new Date(sprint.startDate);
                const endDate = new Date(sprint.endDate);
                const isActive = sprint.status === 'Active';
                const isCompleted = sprint.status === 'Completed';
                
                return (
                  <div key={sprint.id} className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-24 text-sm text-gray-500">
                      {startDate.toLocaleDateString()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          isActive ? 'bg-green-500' : 
                          isCompleted ? 'bg-blue-500' : 
                          'bg-gray-300'
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900">{sprint.name}</h4>
                            <Badge
  className={`ml-2 ${
    sprint.status === 'Active' ? 'bg-green-100 text-green-800' :
    sprint.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
    sprint.status === 'Planning' ? 'bg-yellow-100 text-yellow-800' :
    'bg-red-100 text-red-800'
  }`}
  label={sprint.status}
/>


                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}
    </DashboardLayout>
  );
}