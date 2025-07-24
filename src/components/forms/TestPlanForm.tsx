import React, { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useApiStore } from "@/store/apiStore";
import { TestPlan, TestCase } from "@/store/enhancedStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PlusIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  BeakerIcon,
  ComputerDesktopIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  CalendarIcon,
  DocumentIcon
} from "@heroicons/react/24/outline";
import { Tab } from "@headlessui/react";

interface TestPlanFormData {
  name: string;
  description: string;
  testCaseIds: string[];
  status: "Draft" | "Active" | "Completed";
  startDate?: Date;
  endDate?: Date;
  projectInfo: string;
  objectives: string;
  scope: string;
  testStrategy: string;
  environment: string;
  acceptanceCriteria: string;
  riskManagement: string;
  resources: string;
  schedule: string;
  deliverables: string;
}

interface TestPlanFormProps {
  testPlan?: TestPlan;
  onSuccess: (formData: any) => void;
  onCancel: () => void;
}

export default function TestPlanForm({ testPlan, onSuccess, onCancel }: TestPlanFormProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { addTestPlan, updateTestPlan, testCases } = useApiStore();
  const [formData, setFormData] = useState<TestPlanFormData>({
    name: testPlan?.name || "",
    description: testPlan?.description || "",
    testCaseIds: testPlan?.testCaseIds || [],
    status: testPlan?.status || "Draft",
    startDate: testPlan?.startDate ? new Date(testPlan.startDate) : undefined,
    endDate: testPlan?.endDate ? new Date(testPlan.endDate) : undefined,
    projectInfo: testPlan?.projectInfo || "",
    objectives: testPlan?.objectives || "",
    scope: testPlan?.scope || "",
    testStrategy: testPlan?.testStrategy || "",
    environment: testPlan?.environment || "",
    acceptanceCriteria: testPlan?.acceptanceCriteria || "",
    riskManagement: testPlan?.riskManagement || "",
    resources: testPlan?.resources || "",
    schedule: testPlan?.schedule || "",
    deliverables: testPlan?.deliverables || "",
  });

  const [availableTestCases, setAvailableTestCases] = useState<TestCase[]>([]);
  const [selectedTestCases, setSelectedTestCases] = useState<TestCase[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState(0);

  // Define tabs for the form
  const tabs = [
    { name: "Basic Info", icon: DocumentTextIcon },
    { name: "Planning", icon: ClipboardDocumentListIcon },
    { name: "Execution", icon: BeakerIcon },
    { name: "Resources", icon: UserGroupIcon },
    { name: "Test Cases", icon: CheckCircleIcon },
  ];

  useEffect(() => {
    // Filter test cases that are not already in the test plan
    const available = testCases.filter(
      (tc) => !formData.testCaseIds.includes(tc.id)
    );
    setAvailableTestCases(available);

    // Get selected test cases
    const selected = testCases.filter((tc) =>
      formData.testCaseIds.includes(tc.id)
    );
    setSelectedTestCases(selected);
  }, [testCases, formData.testCaseIds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('TestPlanForm: handleSubmit called');
    console.log('TestPlanForm: formData:', formData);

    // Check authentication status
    if (status === 'loading') {
      console.log('TestPlanForm: Session still loading, please wait');
      alert('Please wait while we verify your authentication...');
      return;
    }

    if (status === 'unauthenticated' || !session?.user?.email) {
      console.error('TestPlanForm: User not authenticated');
      alert('You must be logged in to create test plans. Redirecting to login...');
      router.push('/login');
      return;
    }

    // Validate required fields
    if (!formData.name || formData.name.trim() === '') {
      console.error('TestPlanForm: Name is required');
      alert('Test Plan Name is required');
      return;
    }

    const testPlanData = {
      ...formData,
      createdBy: "current-user-id", // Replace with actual user ID
      createdAt: testPlan?.createdAt || new Date(),
    };

    console.log('TestPlanForm: testPlanData to be sent:', testPlanData);

    try {
      console.log('TestPlanForm: Starting API call...');
      let savedTestPlan;
      if (testPlan) {
        console.log('TestPlanForm: Updating existing test plan');
        savedTestPlan = await updateTestPlan(testPlan.id, testPlanData);
      } else {
        console.log('TestPlanForm: Creating new test plan');
        savedTestPlan = await addTestPlan(testPlanData);
      }
      console.log('TestPlanForm: API call successful, saved test plan:', savedTestPlan);
      console.log('TestPlanForm: Calling onSuccess with:', savedTestPlan);
      if (typeof onSuccess === 'function') {
        onSuccess(savedTestPlan);
      } else {
        console.error('TestPlanForm: onSuccess is not a function:', onSuccess);
      }
    } catch (error) {
      console.error("TestPlanForm: Error saving test plan:", error);
      // You might want to show an error message to the user here
    }
  };

  const addTestCase = (testCaseId: string) => {
    if (!formData.testCaseIds.includes(testCaseId)) {
      setFormData((prev) => ({
        ...prev,
        testCaseIds: [...prev.testCaseIds, testCaseId],
      }));
    }
  };

  const removeTestCase = (testCaseId: string) => {
    setFormData((prev) => ({
      ...prev,
      testCaseIds: prev.testCaseIds.filter((id) => id !== testCaseId),
    }));
  };

  const filteredTestCases = useMemo(() => {
    return availableTestCases.filter((tc) =>
      tc.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [availableTestCases, searchTerm]);

  // Helper function to handle form field changes
  const handleInputChange = (field: keyof TestPlanFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Show authentication required message if user is not authenticated
  if (status === 'unauthenticated' || !session?.user?.email) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-6">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-yellow-800">Authentication Required</h3>
            <p className="text-yellow-700 mt-1">
              You must be logged in to create or edit trial plans.
            </p>
            <button
              onClick={() => router.push('/login')}
              className="mt-3 bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form header with name field */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Test Plan Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          required
        />
      </div>

      {/* Tab navigation */}
      <div className="border-b border-gray-200">
        <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
          <Tab.List className="flex space-x-4">
            {tabs.map((tab, index) => (
              <Tab
                key={tab.name}
                className={({ selected }) =>
                  `py-2 px-3 text-sm font-medium rounded-t-md focus:outline-none ${selected
                    ? "text-primary-600 border-b-2 border-primary-500 bg-primary-50"
                    : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`
                }
              >
                <div className="flex items-center space-x-2">
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </div>
              </Tab>
            ))}
          </Tab.List>
        </Tab.Group>
      </div>

      {/* Tab content */}
      <div className="mt-4">
        {/* Basic Info Tab */}
        {selectedTab === 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    handleInputChange("status", e.target.value as "Draft" | "Active" | "Completed")
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="Draft">Draft</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Summary)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Provide a brief summary of this test plan"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate ? formData.startDate.toISOString().split('T')[0] : ''}
                  onChange={(e) =>
                    handleInputChange("startDate", e.target.value ? new Date(e.target.value) : undefined)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.endDate ? formData.endDate.toISOString().split('T')[0] : ''}
                  onChange={(e) =>
                    handleInputChange("endDate", e.target.value ? new Date(e.target.value) : undefined)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center">
                  <DocumentTextIcon className="h-5 w-5 text-primary-600 mr-2" />
                  <span>Project Information</span>
                </div>
              </label>
              <textarea
                value={formData.projectInfo}
                onChange={(e) => handleInputChange("projectInfo", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Provide information about the project, including name, version, and key stakeholders"
              />
            </div>
          </div>
        )}

        {/* Planning Tab */}
        {selectedTab === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center">
                    <DocumentIcon className="h-5 w-5 text-primary-600 mr-2" />
                    <span>Objectives</span>
                  </div>
                </label>
                <textarea
                  value={formData.objectives}
                  onChange={(e) => handleInputChange("objectives", e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Define the objectives of this test plan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center">
                    <DocumentIcon className="h-5 w-5 text-primary-600 mr-2" />
                    <span>Scope</span>
                  </div>
                </label>
                <textarea
                  value={formData.scope}
                  onChange={(e) => handleInputChange("scope", e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Define what is in and out of scope for this test plan"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center">
                  <BeakerIcon className="h-5 w-5 text-primary-600 mr-2" />
                  <span>Test Strategy</span>
                </div>
              </label>
              <textarea
                value={formData.testStrategy}
                onChange={(e) => handleInputChange("testStrategy", e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Describe the overall approach to testing, including test levels, test types, and test techniques"
              />
            </div>
          </div>
        )}

        {/* Execution Tab */}
        {selectedTab === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center">
                  <ComputerDesktopIcon className="h-5 w-5 text-primary-600 mr-2" />
                  <span>Test Environment</span>
                </div>
              </label>
              <textarea
                value={formData.environment}
                onChange={(e) => handleInputChange("environment", e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Describe the hardware, software, network, and other environmental requirements"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-primary-600 mr-2" />
                  <span>Acceptance Criteria</span>
                </div>
              </label>
              <textarea
                value={formData.acceptanceCriteria}
                onChange={(e) => handleInputChange("acceptanceCriteria", e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Define the criteria that must be met for the testing to be considered complete and successful"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-primary-600 mr-2" />
                  <span>Risk Management</span>
                </div>
              </label>
              <textarea
                value={formData.riskManagement}
                onChange={(e) => handleInputChange("riskManagement", e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Identify potential risks and mitigation strategies"
              />
            </div>
          </div>
        )}

        {/* Resources Tab */}
        {selectedTab === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center">
                  <UserGroupIcon className="h-5 w-5 text-primary-600 mr-2" />
                  <span>Resources</span>
                </div>
              </label>
              <textarea
                value={formData.resources}
                onChange={(e) => handleInputChange("resources", e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="List the human resources, tools, and other resources required for testing"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 text-primary-600 mr-2" />
                  <span>Schedule</span>
                </div>
              </label>
              <textarea
                value={formData.schedule}
                onChange={(e) => handleInputChange("schedule", e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Provide a timeline for testing activities, milestones, and dependencies"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center">
                  <DocumentTextIcon className="h-5 w-5 text-primary-600 mr-2" />
                  <span>Deliverables</span>
                </div>
              </label>
              <textarea
                value={formData.deliverables}
                onChange={(e) => handleInputChange("deliverables", e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="List the documents, reports, and other artifacts that will be produced during testing"
              />
            </div>
          </div>
        )}

        {/* Test Cases Tab */}
        {selectedTab === 4 && (
          <div className="space-y-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Selected Test Cases ({selectedTestCases.length})
                </label>
                <Badge
                  variant="secondary"
                >
                  {`${selectedTestCases.length} selected`}
                </Badge>
              </div>
              {selectedTestCases.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto p-2 border border-gray-200 rounded-md">
                  {selectedTestCases.map((tc) => (
                    <div
                      key={tc.id}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{tc.title}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="secondary">{tc.priority}</Badge>
                          <Badge variant="outline">{tc.type}</Badge>
                          {tc.status && <Badge variant="warning">{tc.status}</Badge>}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTestCase(tc.id)}
                        className="text-red-500 hover:bg-red-50"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 border border-gray-200 rounded-md bg-gray-50 text-center">
                  <p className="text-gray-500 italic">No test cases selected</p>
                  <p className="text-sm text-gray-400 mt-1">Search and add test cases below</p>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Add Test Cases
                </label>
                <Badge
                  variant="secondary"
                >
                  {`${filteredTestCases.length} available`}
                </Badge>
              </div>
              <div className="mb-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search test cases..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto p-2 border border-gray-200 rounded-md">
                {filteredTestCases.length > 0 ? (
                  filteredTestCases.map((tc) => (
                    <div
                      key={tc.id}
                      className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors"
                      onClick={() => addTestCase(tc.id)}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{tc.title}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="secondary">{tc.priority}</Badge>
                          <Badge variant="outline">{tc.type}</Badge>
                          {tc.status && <Badge variant="warning">{tc.status}</Badge>}
                        </div>
                        {tc.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-1">{tc.description}</p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-green-500 hover:bg-green-50"
                      >
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-gray-500 italic">
                      {searchTerm
                        ? "No matching test cases found"
                        : "No available test cases"}
                    </p>
                    {searchTerm && (
                      <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Form actions */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <div className="flex space-x-2">
          {selectedTab > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedTab(selectedTab - 1)}
            >
              Previous
            </Button>
          )}
          {selectedTab < tabs.length - 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedTab(selectedTab + 1)}
            >
              Next
            </Button>
          )}
        </div>
        <div className="flex space-x-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {testPlan ? "Update Test Plan" : "Create Test Plan"}
          </Button>
        </div>
      </div>
    </form>
  );
}
