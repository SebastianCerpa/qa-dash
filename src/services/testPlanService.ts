import { TestPlan } from "../store/enhancedStore";

interface PaginatedResponse<T> {
  testPlans: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiTestPlan {
  id: string;
  title: string;
  description: string | null;
  status: string;
  project_id: string | null;
  created_by: string;
  created_at: Date;
  start_date: Date | null;
  end_date: Date | null;
  objectives: string | null;
  scope: string | null;
  test_strategy: string | null;
  environment: string | null;
  acceptance_criteria: string | null;
  risk_management: string | null;
  resources: string | null;
  schedule: string | null;
  deliverables: string | null;
  users: {
    id: string;
    name: string;
    email: string;
    avatar_url: string | null;
  } | null;
  projects: {
    id: string;
    name: string;
  } | null;
  test_cases: ApiTestCase[];
  executionSummary?: {
    totalTests: number;
    passed: number;
    failed: number;
    blocked: number;
    skipped: number;
    executionRate: number;
  };
}

export interface ApiTestCase {
  actual_result: string;
  linked_task: any;
  assigned_to: any;
  last_executed_by: any;
  last_executed: any;
  estimated_time: number;
  actual_time: number;
  environment: string;
  prerequisites: string;
  ticket_id: string;
  test_plan_id: string;
  automation_script: string;
  created_at: any;
  id: string;
  title: string;
  description?: string;
  priority: string;
  type: string;
  status: string;
  steps?: any[];
  expected_result?: string;
  preconditions?: string;
  tags?: string[];
}

// Convert API test plan to store test plan
export const apiToStoreTestPlan = (apiTestPlan: ApiTestPlan): TestPlan => {
  return {
    id: apiTestPlan.id,
    name: apiTestPlan.title,
    description: apiTestPlan.description || "",
    testCaseIds: apiTestPlan.test_cases?.map(tc => tc.id) || [],
    sprintId: undefined,
    status: (apiTestPlan.status || "Draft") as "Draft" | "Active" | "Completed",
    createdBy: apiTestPlan.users?.name || apiTestPlan.created_by,
    createdAt: new Date(apiTestPlan.created_at),
    startDate: apiTestPlan.start_date ? new Date(apiTestPlan.start_date) : undefined,
    endDate: apiTestPlan.end_date ? new Date(apiTestPlan.end_date) : undefined,
    projectInfo: apiTestPlan.projects?.name || "",
    objectives: apiTestPlan.objectives || "",
    scope: apiTestPlan.scope || "",
    testStrategy: apiTestPlan.test_strategy || "",
    environment: apiTestPlan.environment || "",
    acceptanceCriteria: apiTestPlan.acceptance_criteria || "",
    riskManagement: apiTestPlan.risk_management || "",
    resources: apiTestPlan.resources || "",
    schedule: apiTestPlan.schedule || "",
    deliverables: apiTestPlan.deliverables || "",
    executionSummary: apiTestPlan.executionSummary,
  };
};

// Convert store test plan to API test plan format for creating/updating
export const storeToApiTestPlan = (testPlan: Partial<TestPlan>) => {
  return {
    title: testPlan.name,
    description: testPlan.description,
    project_id: null, // Fixed: projectInfo is a description string, not a project ID
    testCaseIds: testPlan.testCaseIds,
    objectives: testPlan.objectives,
    scope: testPlan.scope,
    test_strategy: testPlan.testStrategy,
    environment: testPlan.environment,
    acceptance_criteria: testPlan.acceptanceCriteria,
    risk_management: testPlan.riskManagement,
    resources: testPlan.resources,
    schedule: testPlan.schedule,
    deliverables: testPlan.deliverables,
  };
};

// Fetch all test plans with pagination
export const fetchTestPlans = async (
  page = 1,
  limit = 20,
  filters: Record<string, string> = {}
): Promise<PaginatedResponse<ApiTestPlan>> => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...filters,
  });

  const response = await fetch(`/api/test-plans?${queryParams.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch test plans");
  }

  return await response.json();
};

// Fetch a single test plan by ID
export const fetchTestPlanById = async (id: string): Promise<ApiTestPlan> => {
  console.log('testPlanService: Fetching test plan with ID:', id);
  const response = await fetch(`/api/test-plans/${id}`);
  console.log('testPlanService: Response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('testPlanService: API error:', response.status, errorText);
    throw new Error(`Failed to fetch test plan: ${response.status}`);
  }

  const data = await response.json();
  console.log('testPlanService: Raw API data:', data);

  return data;
};

// Create a new test plan
export const createTestPlan = async (testPlan: Partial<TestPlan>): Promise<ApiTestPlan> => {
  console.log('TestPlanService: createTestPlan called with:', testPlan);
  const apiData = storeToApiTestPlan(testPlan);
  console.log('TestPlanService: Sending API data:', apiData);

  const response = await fetch("/api/test-plans", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(apiData),
  });

  console.log('TestPlanService: Response status:', response.status);
  console.log('TestPlanService: Response ok:', response.ok);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('TestPlanService: Error response:', errorText);
    throw new Error(`Failed to create test plan: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  console.log('TestPlanService: Success response:', result);
  return result;
};

// Update an existing test plan
export const updateTestPlan = async (id: string, testPlan: Partial<TestPlan>): Promise<ApiTestPlan> => {
  const response = await fetch(`/api/test-plans/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(storeToApiTestPlan(testPlan)),
  });

  if (!response.ok) {
    throw new Error("Failed to update test plan");
  }

  return await response.json();
};

// Delete a test plan
export const deleteTestPlan = async (id: string): Promise<void> => {
  const response = await fetch(`/api/test-plans/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete test plan");
  }
};

// Execute a test plan
export const executeTestPlan = async (
  id: string,
  status: string,
  testCaseResults?: any[]
): Promise<ApiTestPlan> => {
  const response = await fetch(`/api/test-plans/${id}/execute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      status,
      testCaseResults,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to execute test plan");
  }

  const data = await response.json();
  return data.testPlan;
};

// Add or remove test cases from a test plan
export const updateTestPlanTestCases = async (
  id: string,
  testCaseIds: string[],
  action: "add" | "remove"
): Promise<{
  testCases: ApiTestCase[];
  executionSummary: {
    totalTests: number;
    passed: number;
    failed: number;
    blocked: number;
    skipped: number;
    executionRate: number;
  };
}> => {
  const response = await fetch(`/api/test-plans/${id}/test-cases`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      testCaseIds,
      action,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to ${action} test cases to test plan`);
  }

  return await response.json();
};

// Fetch test cases for a test plan
export const fetchTestCasesForTestPlan = async (
  id: string,
  page = 1,
  limit = 50
): Promise<{
  testCases: ApiTestCase[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}> => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const response = await fetch(`/api/test-plans/${id}/test-cases?${queryParams.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch test cases for test plan");
  }

  return await response.json();
};