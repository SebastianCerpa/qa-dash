/* eslint-disable react/jsx-key */
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import TestCaseForm from "@/components/forms/TestCaseForm";
import TestPlanForm from "@/components/forms/TestPlanForm";
import TestCaseCard from "@/components/cards/TestCaseCard";
import { useApiStore } from "@/store/apiStore";
import {
  PlusIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  PlayIcon,
  PencilIcon,
  TrashIcon,
  BeakerIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import type { TestCase, TestPlan } from "@/store/enhancedStore";

interface Tab {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tabs: Tab[] = [
  { id: "test-cases", name: "Test Cases", icon: DocumentTextIcon },
  { id: "test-plans", name: "Test Plans", icon: ClipboardDocumentListIcon },
  { id: "execution", name: "Execution", icon: PlayIcon },
];

export default function TestManagementClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const {
    testCases,
    testPlans,
    addTestCase,
    updateTestCase,
    deleteTestCase,
    addTestPlan,
    updateTestPlan,
    deleteTestPlan,
    executeTestCase,
    fetchTestPlans,
    fetchTestCases,
  } = useApiStore();

  const [activeTab, setActiveTab] = useState("test-cases");
  const [showTestCaseForm, setShowTestCaseForm] = useState(false);
  const [showTestPlanForm, setShowTestPlanForm] = useState(false);
  const [editingTestCase, setEditingTestCase] = useState<TestCase | null>(null);
  const [editingTestPlan, setEditingTestPlan] = useState<TestPlan | null>(null);

  // Initialize data on component mount
  useEffect(() => {
    fetchTestPlans();
    fetchTestCases();
  }, [fetchTestPlans, fetchTestCases]);

  // Handle URL parameters
  useEffect(() => {
    const action = searchParams.get('action');
    const tab = searchParams.get('tab');
    const editId = searchParams.get('edit');
    
    if (tab && tabs.some(t => t.id === tab)) {
      setActiveTab(tab);
    }
    
    if (action === 'create-test-case') {
      setShowTestCaseForm(true);
      setEditingTestCase(null);
    } else if (action === 'create-test-plan') {
      setShowTestPlanForm(true);
      setEditingTestPlan(null);
    } else if (action === 'edit-test-case' && editId) {
      const testCase = testCases.find(tc => tc.id === editId);
      if (testCase) {
        setEditingTestCase(testCase);
        setShowTestCaseForm(true);
      }
    } else if (action === 'edit-test-plan' && editId) {
      const testPlan = testPlans?.find(tp => tp.id === editId);
      if (testPlan) {
        setEditingTestPlan(testPlan);
        setShowTestPlanForm(true);
      }
    }
  }, [searchParams, testCases, testPlans]);

  const handleAddTestCase = () => {
    setEditingTestCase(null);
    setShowTestCaseForm(true);
    router.push('/test-management?action=create-test-case');
  };

  const handleAddTestPlan = () => {
    setEditingTestPlan(null);
    setShowTestPlanForm(true);
    router.push('/test-management?action=create-test-plan');
  };

  const handleEditTestCase = (id: string) => {
    const testCase = testCases.find((tc) => tc.id === id);
    if (testCase) {
      setEditingTestCase(testCase);
      setShowTestCaseForm(true);
      router.push(`/test-management?action=edit-test-case&edit=${id}`);
    }
  };

  const handleEditTestPlan = (id: string) => {
    const testPlan = testPlans?.find((tp) => tp.id === id);
    if (testPlan) {
      setEditingTestPlan(testPlan);
      setShowTestPlanForm(true);
      router.push(`/test-management?action=edit-test-plan&edit=${id}`);
    }
  };

  const handleDeleteTestCase = (id: string) => {
    if (window.confirm("Are you sure you want to delete this test case?")) {
      deleteTestCase(id);
    }
  };

  const handleExecuteTestCase = (id: string) => {
    const testCase = testCases.find((tc) => tc.id === id);
    if (testCase) {
      executeTestCase(id, {
        status: "Passed",
        notes: "Test executed successfully",
        bug_report: null
      });
    }
  };

  const handleViewTestCase = (id: string) => {
    router.push(`/test-management/test-case/${id}`);
  };

  const handleViewTestPlan = (id: string) => {
    router.push(`/test-plans/${id}`);
  };

  const handleTestCaseFormSuccess = () => {
    setShowTestCaseForm(false);
    setEditingTestCase(null);
    router.push('/test-management');
  };

  const handleTestPlanFormSuccess = (formData?: any) => {
    setShowTestPlanForm(false);
    setEditingTestPlan(null);
    
    // If we have a test plan ID (either from editing or newly created), redirect to its detail page
    if (editingTestPlan?.id) {
      // For editing existing test plan - redirect to the detailed view with tabs
      router.push(`/test-plans/${editingTestPlan.id}`);
    } else if (formData?.id) {
      // For newly created test plan (if the API returns the ID) - redirect to the detailed view with tabs
      router.push(`/test-plans/${formData.id}`);
    } else {
      // Fallback to test management page
      router.push('/test-management');
    }
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    router.push(`/test-management?tab=${tabId}`);
  };

  const stats = useMemo(() => {
    const totalTestCases = testCases.length;
    const passedTestCases = testCases.filter(
      (tc) => tc.status === "Passed"
    ).length;
    const failedTestCases = testCases.filter(
      (tc) => tc.status === "Failed"
    ).length;
    const pendingTestCases = testCases.filter(
      (tc) => tc.status === "Not Executed" || tc.status === "Blocked" || tc.status === "Skipped"
    ).length;

    return {
      total: totalTestCases,
      passed: passedTestCases,
      failed: failedTestCases,
      pending: pendingTestCases,
      passRate:
        totalTestCases > 0
          ? Math.round((passedTestCases / totalTestCases) * 100)
          : 0,
    };
  }, [testCases]);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Test Management</h1>
            <p className="text-gray-600 mt-1">
              Manage your test cases, test plans, and execution results
            </p>
          </div>
          <div className="flex space-x-3">
            <Button onClick={handleAddTestCase}>
              <PlusIcon className="h-5 w-5 mr-2" />
              New Test Case
            </Button>
            <Button onClick={handleAddTestPlan} variant="outline">
              <PlusIcon className="h-5 w-5 mr-2" />
              New Test Plan
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BeakerIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Test Cases
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.total}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClipboardDocumentCheckIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Passed
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.passed}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClipboardDocumentCheckIcon className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Failed
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.failed}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClipboardDocumentCheckIcon className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pending
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.pending}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClipboardDocumentCheckIcon className="h-8 w-8 text-indigo-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pass Rate
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.passRate}%
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
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
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  {editingTestCase ? "Edit Test Case" : "Create New Test Case"}
                </h2>
                <div className="bg-indigo-100 text-indigo-700 text-sm font-medium px-2.5 py-0.5 rounded-full">
                  {editingTestCase ? 'Editing Mode' : 'Creation Mode'}
                </div>
              </div>
              <TestCaseForm
                initialData={editingTestCase || undefined}
                onSubmit={async (data) => {
                  // Transform data to match store interface
                  const transformedData = {
                    ...data,
                    steps: data.steps.map(step => ({
                      id: step.id,
                      stepNumber: step.stepNumber,
                      action: step.action || step.description || "",
                      expectedResult: step.expectedResult || "",
                      actualResult: step.actualResult || "",
                      status: step.status,
                      screenshot: step.screenshot
                    })),
                    linkedTickets: data.linkedTicketIds || [],
                    linkedTicketIds: data.linkedTicketIds || [],
                    environment: data.environment || "",
                    preconditions: data.preconditions || "",
                    prerequisites: data.preconditions || "",
                    estimatedTime: data.estimatedTime || 0,
                    tags: data.tags || [],
                    ticketId: data.linkedTicketIds?.[0] || "",
                    status: data.status || "Not Executed"
                  };
                  
                  if (editingTestCase) {
                    await updateTestCase(editingTestCase.id, transformedData);
                  } else {
                    await addTestCase(transformedData);
                  }
                  handleTestCaseFormSuccess();
                }}
                onCancel={() => setShowTestCaseForm(false)}
              />
            </div>
          </Card>
        </div>
      )}

      {showTestPlanForm && (
        <div className="mb-6">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  {editingTestPlan ? "Edit Test Plan" : "Create New Test Plan"}
                </h2>
                <div className="bg-indigo-100 text-indigo-700 text-sm font-medium px-2.5 py-0.5 rounded-full">
                  {editingTestPlan ? 'Editing Mode' : 'Creation Mode'}
                </div>
              </div>
              <TestPlanForm
                testPlan={editingTestPlan || undefined}
                onSuccess={handleTestPlanFormSuccess}
                onCancel={() => setShowTestPlanForm(false)}
              />
            </div>
          </Card>
        </div>
      )}

      {/* Content */}
      {activeTab === "test-cases" && (
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
                  onClick={handleViewTestCase}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No test cases
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first test case.
              </p>
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

      {activeTab === "test-plans" && (
        <div>
          {testPlans && testPlans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testPlans.map((testPlan) => (
                <Card 
                  key={testPlan.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleViewTestPlan(testPlan.id)}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {testPlan.name}
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge variant={testPlan.status === "Completed" ? "success" : testPlan.status === "Active" ? "outline" : "secondary"}>{testPlan.status}</Badge>
                          <Badge variant="secondary">{`${testPlan.testCaseIds.length} Test Cases`}</Badge>
                        </div>
                      </div>
                      <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log("Execute test plan:", testPlan.id);
                          }}
                        >
                          <PlayIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditTestPlan(testPlan.id);
                          }}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm("Are you sure you want to delete this test plan?")) {
                              deleteTestPlan(testPlan.id);
                            }
                          }}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      {testPlan.description ? (
                        testPlan.description.length > 100 
                          ? `${testPlan.description.substring(0, 100)}...` 
                          : testPlan.description
                      ) : (
                        "No description provided"
                      )}
                    </p>
                    {testPlan.startDate && testPlan.endDate && (
                      <div className="text-xs text-gray-500">
                        {typeof testPlan.startDate === 'string' ? new Date(testPlan.startDate).toLocaleDateString() : testPlan.startDate instanceof Date ? testPlan.startDate.toLocaleDateString() : 'N/A'} - 
                        {typeof testPlan.endDate === 'string' ? new Date(testPlan.endDate).toLocaleDateString() : testPlan.endDate instanceof Date ? testPlan.endDate.toLocaleDateString() : 'N/A'}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No test plans</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first test plan.
              </p>
              <div className="mt-6">
                <Button onClick={handleAddTestPlan}>
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Create Test Plan
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "execution" && (
        <div className="text-center py-12">
          <PlayIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Test Execution
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Test execution interface coming soon...
          </p>
        </div>
      )}
    </DashboardLayout>
  );
}