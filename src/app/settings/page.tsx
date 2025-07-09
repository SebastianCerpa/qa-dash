'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';

export default function SettingsPage() {
  const { setCurrentUser, currentUser, teamMembers } = useStore();
  const [darkMode, setDarkMode] = useState(false);

  // Test types management
  const [testTypes, setTestTypes] = useState([
    'Positive Test',
    'Negative Test',
    'Functional Test',
    'Non-functional Test',
    'Regression Test',
    'API Test',
    'Exploratory Test',
    'Boundary Test',
    'Smoke Test',
    'Stress Test',
    'Accessibility Test'
  ]);
  const [newTestType, setNewTestType] = useState('');

  const handleAddTestType = () => {
    if (newTestType && !testTypes.includes(newTestType)) {
      setTestTypes([...testTypes, newTestType]);
      setNewTestType('');
    }
  };

  const handleRemoveTestType = (type: string) => {
    setTestTypes(testTypes.filter(t => t !== type));
  };

  const handleSaveSettings = () => {
    // In a real app, this would save to backend or localStorage
    alert('Settings saved successfully!');
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure your QA dashboard preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* User Preferences */}
        <Card className="border border-gray-200 shadow-md">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold">User Preferences</h3>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-700">Current User</label>
              <select
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                value={currentUser?.id || ''}
                onChange={(e) => {
                  const selectedMember = teamMembers.find(m => m.id === e.target.value);
                  if (selectedMember) setCurrentUser(selectedMember);
                }}
              >
                <option value="">Select a user</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex-grow flex flex-col">
                <span className="text-sm font-medium text-gray-900">Dark Mode</span>
                <span className="text-sm text-gray-500">Enable dark theme for the dashboard</span>
              </span>
              <button
                type="button"
                className={`${darkMode ? 'bg-primary-600' : 'bg-gray-200'} relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
                onClick={() => setDarkMode(!darkMode)}
              >
                <span className="sr-only">Use dark mode</span>
                <span
                  className={`${darkMode ? 'translate-x-5' : 'translate-x-0'} pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                >
                  <span
                    className={`${darkMode ? 'opacity-0 ease-out duration-100' : 'opacity-100 ease-in duration-200'} absolute inset-0 h-full w-full flex items-center justify-center transition-opacity`}
                    aria-hidden="true"
                  >
                    <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 12 12">
                      <path
                        d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span
                    className={`${darkMode ? 'opacity-100 ease-in duration-200' : 'opacity-0 ease-out duration-100'} absolute inset-0 h-full w-full flex items-center justify-center transition-opacity`}
                    aria-hidden="true"
                  >
                    <svg className="h-3 w-3 text-primary-600" fill="currentColor" viewBox="0 0 12 12">
                      <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                    </svg>
                  </span>
                </span>
              </button>
            </div>

            {/* Email notifications and auto-assign options removed */}
          </div>
        </Card>

        {/* Test Types Management */}
        <Card className="border border-gray-200 shadow-md">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold">Test Types Management</h3>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-500 mb-4">
              Manage the types of tests available for task creation
            </p>

            <div className="mb-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTestType}
                  onChange={(e) => setNewTestType(e.target.value)}
                  placeholder="Add new test type"
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
                <Button onClick={handleAddTestType}>Add</Button>
              </div>
            </div>

            <div className="space-y-2">
              {testTypes.map((type) => (
                <div key={type} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                  <span>{type}</span>
                  <button
                    onClick={() => handleRemoveTestType(type)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSaveSettings} variant="secondary">
            Save Settings
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}