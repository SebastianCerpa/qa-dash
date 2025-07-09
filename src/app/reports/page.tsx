'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import TestTypeChart from '@/components/dashboard/TestTypeChart';
import TaskStatusChart from '@/components/dashboard/TaskStatusChart';
import { useStore } from '@/store/useStore';

// Placeholder charts
const TaskCompletionTrendChart = () => (
  <div className="h-64 flex items-center justify-center">
    <p className="text-gray-500">Task completion trend chart will be implemented here</p>
  </div>
);

const TestResultsChart = () => (
  <div className="h-64 flex items-center justify-center">
    <p className="text-gray-500">Test results chart will be implemented here</p>
  </div>
);

export default function ReportsPage() {
  const { tasks, workflows, teamMembers } = useStore();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks'>('overview');

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'Done').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Reports & Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          View metrics and analytics for your QA testing activities
        </p>
      </div>

      {/* Tab selector */}
      <div className="mb-4 flex space-x-4">
        {['overview', 'tasks'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as 'overview' | 'tasks')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === tab
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Time range selector */}
      <div className="mb-6">
        <div className="inline-flex rounded-md shadow-sm">
          {['week', 'month', 'quarter', 'year'].map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setTimeRange(range as typeof timeRange)}
              className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                timeRange === range
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } ${range === 'week' ? 'rounded-l-md' : ''} ${range === 'year' ? 'rounded-r-md' : ''} border border-gray-300`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Tasks</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{totalTasks}</dd>
          </div>
        </Card>
        <Card>
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Completion Rate</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{completionRate}%</dd>
          </div>
        </Card>
        <Card>
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Active Workflows</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{workflows.length}</dd>
          </div>
        </Card>
        <Card>
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Team Members</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{teamMembers.length}</dd>
          </div>
        </Card>
      </div>

      {/* Charts */}
      {(activeTab === 'overview' || activeTab === 'tasks') && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6">
          <Card title="Task Status Distribution">
            <div className="p-4 h-80">
              <TaskStatusChart />
            </div>
          </Card>
          <Card title="Test Type Distribution">
            <div className="p-4 h-80">
              <TestTypeChart />
            </div>
          </Card>
          {activeTab === 'tasks' && (
            <>
              <Card title="Task Completion Trend">
                <div className="p-4 h-80">
                  <TaskCompletionTrendChart />
                </div>
              </Card>
              <Card title="Test Results (Pass/Fail Rate)">
                <div className="p-4 h-80">
                  <TestResultsChart />
                </div>
              </Card>
            </>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
