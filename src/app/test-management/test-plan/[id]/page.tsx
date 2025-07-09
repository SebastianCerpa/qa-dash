"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApiStore } from "@/store/apiStore";
import { TestPlan, TestCase } from "@/store/enhancedStore";
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  PlayIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
  CalendarIcon,
  UserGroupIcon,
  BeakerIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CubeIcon,
  ClipboardIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";

export default function TestPlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { fetchTestPlanById, fetchTestCasesForTestPlan, deleteTestPlan, testCases, isLoading } = useApiStore();
  const [testPlan, setTestPlan] = useState<TestPlan | null>(null);
  const [planTestCases, setPlanTestCases] = useState<TestCase[]>([]);

  useEffect(() => {
    const loadTestPlan = async () => {
      if (params.id) {
        const id = Array.isArray(params.id) ? params.id[0] : params.id;
        console.log('Test Plan ID:', id);
        
        try {
          const foundTestPlan = await fetchTestPlanById(id);
          console.log('Found Test Plan:', foundTestPlan);
          setTestPlan(foundTestPlan);
          
          if (foundTestPlan) {
            // Fetch test cases for this test plan
            await fetchTestCasesForTestPlan(id);
          }
        } catch (error) {
          console.error('Error loading test plan:', error);
          setTestPlan(null);
        }
      }
    };
    
    loadTestPlan();
  }, [params.id, fetchTestPlanById, fetchTestCasesForTestPlan]);
  
  useEffect(() => {
    if (testPlan) {
      const relatedTestCases = testCases.filter((tc) =>
        tc.testPlanId === testPlan.id
      );
      setPlanTestCases(relatedTestCases);
    }
  }, [testCases, testPlan]);

  const handleEdit = () => {
    router.push(`/test-plans/${testPlan?.id}/edit`);
  };

  const handleDelete = () => {
    if (testPlan && window.confirm("Are you sure you want to delete this test plan?")) {
      deleteTestPlan(testPlan.id);
      router.push("/test-plans");
    }
  };

  const handleExecute = () => {
    // Implement test plan execution
    console.log("Execute test plan:", testPlan?.id);
  };

  const getStatusVariant = (
    status: string
  ): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" => {
    switch (status) {
      case "Draft":
        return "default";
      case "Active":
        return "outline";
      case "Completed":
        return "success";
      default:
        return "default";
    }
  };

  const getTestCaseStatusVariant = (
    status: string
  ): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" => {
    switch (status) {
      case "Passed":
        return "success";
      case "Failed":
        return "destructive";
      case "Blocked":
        return "warning";
      case "Not Executed":
        return "default";
      default:
        return "default";
    }
  };

  const getTestCasePriorityVariant = (
    priority: string
  ): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" => {
    switch (priority) {
      case "Critical":
        return "destructive";
      case "High":
        return "warning";
      case "Medium":
        return "secondary";
      case "Low":
        return "outline";
      default:
        return "default";
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading test plan...</p>
        </div>
      </DashboardLayout>
    );
  }
  
  if (!testPlan) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Test plan not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/test-management/")}
            className="mr-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Test Plans
          </Button>
        </div>

        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {testPlan.name}
            </h1>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge
                variant={getStatusVariant(testPlan.status)}
                size="sm"
              >
                {testPlan.status}
              </Badge>
              <Badge
                variant="secondary"
                size="sm"
              >
                {`${testPlan.testCaseIds.length} Test Cases`}
              </Badge>
              {testPlan.executionSummary && (
                <Badge
                  variant="outline"
                  size="sm"
                >
                  {`${Math.round(testPlan.executionSummary.executionRate * 100)}% Complete`}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExecute}
              className="flex items-center"
            >
              <PlayIcon className="h-4 w-4 mr-2" />
              Execute Plan
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="flex items-center"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="flex items-center text-red-600 hover:bg-red-50"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Description</h2>
                <p className="text-gray-700 whitespace-pre-line">
                  {testPlan.description || "No description provided."}
                </p>
              </div>
            </Card>

            <Card className="mb-6">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Project Information</h2>
                <p className="text-gray-700 whitespace-pre-line">
                  {testPlan.projectInfo || "No project information provided."}
                </p>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <DocumentIcon className="h-5 w-5 text-primary-600 mr-2" />
                    <h2 className="text-lg font-semibold">Objectives</h2>
                  </div>
                  <p className="text-gray-700 whitespace-pre-line">
                    {testPlan.objectives || "No objectives defined."}
                  </p>
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <ClipboardIcon className="h-5 w-5 text-primary-600 mr-2" />
                    <h2 className="text-lg font-semibold">Scope</h2>
                  </div>
                  <p className="text-gray-700 whitespace-pre-line">
                    {testPlan.scope || "No scope defined."}
                  </p>
                </div>
              </Card>
            </div>

            <Card className="mb-6">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <BeakerIcon className="h-5 w-5 text-primary-600 mr-2" />
                  <h2 className="text-lg font-semibold">Test Strategy</h2>
                </div>
                <p className="text-gray-700 whitespace-pre-line">
                  {testPlan.testStrategy || "No test strategy defined."}
                </p>
              </div>
            </Card>

            <Card className="mb-6">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <CubeIcon className="h-5 w-5 text-primary-600 mr-2" />
                  <h2 className="text-lg font-semibold">Test Environment</h2>
                </div>
                <p className="text-gray-700 whitespace-pre-line">
                  {testPlan.environment || "No environment specifications provided."}
                </p>
              </div>
            </Card>

            <Card className="mb-6">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <ShieldCheckIcon className="h-5 w-5 text-primary-600 mr-2" />
                  <h2 className="text-lg font-semibold">Acceptance Criteria</h2>
                </div>
                <p className="text-gray-700 whitespace-pre-line">
                  {testPlan.acceptanceCriteria || "No acceptance criteria defined."}
                </p>
              </div>
            </Card>

            <Card className="mb-6">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <ExclamationTriangleIcon className="h-5 w-5 text-primary-600 mr-2" />
                  <h2 className="text-lg font-semibold">Risk Management</h2>
                </div>
                <p className="text-gray-700 whitespace-pre-line">
                  {testPlan.riskManagement || "No risk management strategy defined."}
                </p>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <UserGroupIcon className="h-5 w-5 text-primary-600 mr-2" />
                    <h2 className="text-lg font-semibold">Resources</h2>
                  </div>
                  <p className="text-gray-700 whitespace-pre-line">
                    {testPlan.resources || "No resources specified."}
                  </p>
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <CalendarIcon className="h-5 w-5 text-primary-600 mr-2" />
                    <h2 className="text-lg font-semibold">Schedule</h2>
                  </div>
                  <p className="text-gray-700 whitespace-pre-line">
                    {testPlan.schedule || "No schedule defined."}
                  </p>
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <DocumentTextIcon className="h-5 w-5 text-primary-600 mr-2" />
                    <h2 className="text-lg font-semibold">Deliverables</h2>
                  </div>
                  <p className="text-gray-700 whitespace-pre-line">
                    {testPlan.deliverables || "No deliverables specified."}
                  </p>
                </div>
              </Card>
            </div>

            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Test Cases</h2>
                {planTestCases.length > 0 ? (
                  <div className="space-y-4">
                    {planTestCases.map((testCase) => (
                      <div
                        key={testCase.id}
                        className="border border-gray-200 rounded-md p-4 hover:border-blue-300 hover:bg-blue-50/30 transition-colors cursor-pointer"
                        onClick={() => router.push(`/test-management/test-case/${testCase.id}`)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {testCase.title}
                            </h3>
                            <div className="flex flex-wrap gap-2 mt-1">
                              <Badge
                                variant={getTestCasePriorityVariant(testCase.priority)}
                                size="sm"
                              >
                                {testCase.priority}
                              </Badge>
                              <Badge
                                variant={getTestCaseStatusVariant(testCase.status)}
                                size="sm"
                              >
                                {testCase.status}
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <Badge
                              variant="secondary"
                              size="sm"
                            >
                              {testCase.type}
                            </Badge>
                          </div>
                        </div>
                        {testCase.description && (
                          <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                            {testCase.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No test cases in this plan.</p>
                )}
              </div>
            </Card>
          </div>

          <div>
            <Card className="mb-6">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Details</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <div className="mt-1 flex items-center">
                      {testPlan.status === "Completed" ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                      ) : testPlan.status === "Active" ? (
                        <PlayIcon className="h-5 w-5 text-blue-500 mr-2" />
                      ) : (
                        <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                      )}
                      <span
                        className={`font-medium ${testPlan.status === "Completed"
                            ? "text-green-700"
                            : testPlan.status === "Active"
                              ? "text-blue-700"
                              : "text-gray-700"
                          }`}
                      >
                        {testPlan.status}
                      </span>
                    </div>
                  </div>

                  {testPlan.startDate && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Start Date</h3>
                      <p className="mt-1 text-gray-700">
                        {new Date(testPlan.startDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {testPlan.endDate && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">End Date</h3>
                      <p className="mt-1 text-gray-700">
                        {new Date(testPlan.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Created By
                    </h3>
                    <p className="mt-1 text-gray-700">{testPlan.createdBy}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Created At
                    </h3>
                    <p className="mt-1 text-gray-700">
                      {new Date(testPlan.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {testPlan.executionSummary && (
                    <div className="pt-2 border-t border-gray-200">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Execution Summary
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total:</span>
                          <span className="font-medium">
                            {testPlan.executionSummary.totalTests}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Passed:</span>
                          <span className="font-medium text-green-600">
                            {testPlan.executionSummary.passed}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Failed:</span>
                          <span className="font-medium text-red-600">
                            {testPlan.executionSummary.failed}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Blocked:</span>
                          <span className="font-medium text-yellow-600">
                            {testPlan.executionSummary.blocked}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Skipped:</span>
                          <span className="font-medium text-gray-600">
                            {testPlan.executionSummary.skipped}
                          </span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">
                            Completion:
                          </span>
                          <span className="font-medium text-blue-600">
                            {Math.round(
                              testPlan.executionSummary.executionRate * 100
                            )}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}