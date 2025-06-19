'use client';

import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useEnhancedQAStore, TestCase, TestPlan, TestStep } from '@/store/enhancedStore';
import {
  PlusIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  PlayIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

type TabType = 'test-cases' | 'test-plans' | 'execution';

interface TestCaseFormData {
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  type: 'Functional' | 'Integration' | 'Performance' | 'Security' | 'Usability' | 'Regression';
  preconditions: string;
  steps: TestStep[];
  expectedResult: string;
  ticketId?: string;
  tags: string[];
}

interface TestPlanFormData {
  name: string;
  description: string;
  objective: string;
  scope: string;
  testCaseIds: string[];
  sprintId?: string;
  startDate: string;
  endDate: string;
  status: 'Draft' | 'Active' | 'Completed' | 'Cancelled';
}

function TestCaseForm({ 
  testCase, 
  onSuccess, 
  onCancel 
}: { 
  testCase?: TestCase; 
  onSuccess: () => void; 
  onCancel: () => void; 
}) {
  const { addTestCase, updateTestCase, tickets } = useEnhancedQAStore();
  const [formData, setFormData] = useState<TestCaseFormData>({
    title: testCase?.title || '',
    description: testCase?.description || '',
    priority: testCase?.priority || 'Medium',
    type: testCase?.type || 'Functional',
    preconditions: testCase?.preconditions || '',
    steps: testCase?.steps || [{ stepNumber: 1, action: '', expectedResult: '' }],
    expectedResult: testCase?.expectedResult || '',
    ticketId: testCase?.ticketId || '',
    tags: testCase?.tags || []
  });
  const [newTag, setNewTag] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (testCase) {
      updateTestCase(testCase.id, formData);
    } else {
      addTestCase(formData);
    }
    
    onSuccess();
  };

  const addStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, { 
        stepNumber: prev.steps.length + 1, 
        action: '', 
        expectedResult: '' 
      }]
    }));
  };

  const updateStep = (index: number, field: keyof TestStep, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => 
        i === index ? { ...step, [field]: value } : step
      )
    }));
  };

  const removeStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
        .map((step, i) => ({ ...step, stepNumber: i + 1 }))
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Case Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority
          </label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Type
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="Functional">Functional</option>
            <option value="Integration">Integration</option>
            <option value="Performance">Performance</option>
            <option value="Security">Security</option>
            <option value="Usability">Usability</option>
            <option value="Regression">Regression</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Linked Ticket
          </label>
          <select
            value={formData.ticketId}
            onChange={(e) => setFormData(prev => ({ ...prev, ticketId: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">No ticket linked</option>
            {tickets.map(ticket => (
              <option key={ticket.id} value={ticket.id}>{ticket.title}</option>
            ))}
          </select>
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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Preconditions
        </label>
        <textarea
          value={formData.preconditions}
          onChange={(e) => setFormData(prev => ({ ...prev, preconditions: e.target.value }))}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Any setup or conditions required before executing this test"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Test Steps *
          </label>
          <Button type="button" variant="outline" size="sm" onClick={addStep}>
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Step
          </Button>
        </div>
        <div className="space-y-3">
          {formData.steps.map((step, index) => (
            <div key={index} className="border border-gray-200 rounded-md p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Step {step.stepNumber}</span>
                {formData.steps.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeStep(index)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Action
                  </label>
                  <textarea
                    value={step.action}
                    onChange={(e) => updateStep(index, 'action', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    placeholder="Describe the action to perform"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Expected Result
                  </label>
                  <textarea
                    value={step.expectedResult}
                    onChange={(e) => updateStep(index, 'expectedResult', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    placeholder="Describe the expected outcome"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Overall Expected Result
        </label>
        <textarea
          value={formData.expectedResult}
          onChange={(e) => setFormData(prev => ({ ...prev, expectedResult: e.target.value }))}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Overall expected outcome of the test case"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.tags.map(tag => (
            <Badge key={tag} className="bg-blue-100 text-blue-800">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Add a tag"
          />
          <Button type="button" variant="outline" onClick={addTag}>
            Add
          </Button>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {testCase ? 'Update Test Case' : 'Create Test Case'}
        </Button>
      </div>
    </form>
  );
}

function TestCaseCard({ testCase, onEdit, onDelete, onExecute }: {
  testCase: TestCase;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onExecute: (id: string) => void;
}) {
  const { tickets } = useEnhancedQAStore();
  const linkedTicket = testCase.ticketId ? tickets.find(t => t.id === testCase.ticketId) : null;
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Passed': return 'bg-green-100 text-green-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      case 'Blocked': return 'bg-yellow-100 text-yellow-800';
      case 'Not Executed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{testCase.title}</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge className={getPriorityColor(testCase.priority)}>
                {testCase.priority}
              </Badge>
              <Badge className="bg-blue-100 text-blue-800">
                {testCase.type}
              </Badge>
              <Badge className={getStatusColor(testCase.status)}>
                {testCase.status}
              </Badge>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" onClick={() => onExecute(testCase.id)}>
              <PlayIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onEdit(testCase.id)}>
              <PencilIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(testCase.id)}>
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {testCase.description && (
          <p className="text-gray-600 mb-4 text-sm">{testCase.description}</p>
        )}

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <DocumentTextIcon className="h-4 w-4 mr-2" />
            {testCase.steps.length} test steps
          </div>
          
          {linkedTicket && (
            <div className="flex items-center text-sm text-gray-600">
              <ClipboardDocumentListIcon className="h-4 w-4 mr-2" />
              Linked to: {linkedTicket.title}
            </div>
          )}
          
          {testCase.lastExecuted && (
            <div className="flex items-center text-sm text-gray-600">
              <ClockIcon className="h-4 w-4 mr-2" />
              Last executed: {new Date(testCase.lastExecuted).toLocaleDateString()}
            </div>
          )}
        </div>

        {testCase.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {testCase.tags.map(tag => (
              <Badge key={tag} className="bg-gray-100 text-gray-700 text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

export default function TestManagementPage() {
  const { testCases, testPlans, deleteTestCase, deleteTestPlan } = useEnhancedQAStore();
  const [activeTab, setActiveTab] = useState<TabType>('test-cases');
  const [showTestCaseForm, setShowTestCaseForm] = useState(false);
  const [showTestPlanForm, setShowTestPlanForm] = useState(false);
  const [editingTestCase, setEditingTestCase] = useState<TestCase | null>(null);
  const [editingTestPlan, setEditingTestPlan] = useState<TestPlan | null>(null);

  const handleAddTestCase = () => {
    setEditingTestCase(null);
    setShowTestCaseForm(true);
  };

  const handleEditTestCase = (testCaseId: string) => {
    const testCase = testCases.find(tc => tc.id === testCaseId);
    setEditingTestCase(testCase || null);
    setShowTestCaseForm(true);
  };

  const handleDeleteTestCase = (testCaseId: string) => {
    if (window.confirm('Are you sure you want to delete this test case?')) {
      deleteTestCase(testCaseId);
    }
  };

  const handleExecuteTestCase = (testCaseId: string) => {
    // This would open a test execution modal
    console.log('Execute test case:', testCaseId);
  };

  const handleTestCaseFormSuccess = () => {
    setShowTestCaseForm(false);
    setEditingTestCase(null);
  };

  const testCaseStats = useMemo(() => {
    const total = testCases.length;
    const passed = testCases.filter(tc => tc.status === 'Passed').length;
    const failed = testCases.filter(tc => tc.status === 'Failed').length;
    const notExecuted = testCases.filter(tc => tc.status === 'Not Executed').length;
    const blocked = testCases.filter(tc => tc.status === 'Blocked').length;
    
    return { total, passed, failed, notExecuted, blocked };
  }, [testCases]);

  const tabs = [
    { id: 'test-cases', name: 'Test Cases', icon: DocumentTextIcon },
    { id: 'test-plans', name: 'Test Plans', icon: ClipboardDocumentListIcon },
    { id: 'execution', name: 'Test Execution', icon: PlayIcon }
  ];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Test Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Create, manage, and execute test cases and test plans
            </p>
          </div>
          <div className="flex space-x-2">
            {activeTab === 'test-cases' && (
              <Button
                onClick={handleAddTestCase}
                leftIcon={<PlusIcon className="h-5 w-5" />}
              >
                Create Test Case
              </Button>
            )}
            {activeTab === 'test-plans' && (
              <Button
                onClick={() => setShowTestPlanForm(true)}
                leftIcon={<PlusIcon className="h-5 w-5" />}
              >
                Create Test Plan
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <div className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DocumentTextIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Tests</p>
                  <p className="text-2xl font-semibold text-gray-900">{testCaseStats.total}</p>
                </div>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Passed</p>
                  <p className="text-2xl font-semibold text-gray-900">{testCaseStats.passed}</p>
                </div>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <XCircleIcon className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Failed</p>
                  <p className="text-2xl font-semibold text-gray-900">{testCaseStats.failed}</p>
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
                  <p className="text-sm font-medium text-gray-500">Blocked</p>
                  <p className="text-2xl font-semibold text-gray-900">{testCaseStats.blocked}</p>
                </div>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ArrowDownTrayIcon className="h-8 w-8 text-gray-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Not Executed</p>
                  <p className="text-2xl font-semibold text-gray-900">{testCaseStats.notExecuted}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Forms */}
      {showTestCaseForm && (
        <div className="mb-6">
          <Card title={editingTestCase ? 'Edit Test Case' : 'Create New Test Case'}>
            <TestCaseForm
              testCase={editingTestCase || undefined}
              onSuccess={handleTestCaseFormSuccess}
              onCancel={() => setShowTestCaseForm(false)}
            />
          </Card>
        </div>
      )}

      {/* Content */}
      {activeTab === 'test-cases' && (
        <div>
          {testCases.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testCases.map((testCase) => (
                <TestCaseCard
                  key={testCase.id}
                  testCase={testCase}
                  onEdit={handleEditTestCase}
                  onDelete={handleDeleteTestCase}
                  onExecute={handleExecuteTestCase}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No test cases</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first test case.</p>
              <div className="mt-6">
                <Button onClick={handleAddTestCase}>
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Create Test Case
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'test-plans' && (
        <div className="text-center py-12">
          <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Test Plans</h3>
          <p className="mt-1 text-sm text-gray-500">Test plan management coming soon...</p>
        </div>
      )}

      {activeTab === 'execution' && (
        <div className="text-center py-12">
          <PlayIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Test Execution</h3>
          <p className="mt-1 text-sm text-gray-500">Test execution interface coming soon...</p>
        </div>
      )}
    </DashboardLayout>
  );
}