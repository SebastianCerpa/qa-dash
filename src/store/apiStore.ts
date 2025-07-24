import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TestCase, TestPlan } from "./enhancedStore";
import * as testPlanService from "../services/testPlanService";

interface ApiStore {
  // State
  testPlans: TestPlan[];
  testCases: TestCase[];
  testCase: TestCase | null;
  isLoading: boolean;
  error: string | null;

  // Test Plan Actions
  fetchTestPlans: (page?: number, limit?: number, filters?: Record<string, string>) => Promise<void>;
  fetchTestPlanById: (id: string) => Promise<TestPlan | null>;
  addTestPlan: (testPlan: Omit<TestPlan, "id">) => Promise<TestPlan>;
  updateTestPlan: (id: string, updates: Partial<TestPlan>) => Promise<TestPlan>;
  deleteTestPlan: (id: string) => Promise<void>;
  executeTestPlan: (id: string, status: string, testCaseResults?: any[]) => Promise<TestPlan>;
  
  // Test Case Actions for Test Plans
  fetchTestCasesForTestPlan: (testPlanId: string, page?: number, limit?: number) => Promise<void>;
  addTestCasesToTestPlan: (testPlanId: string, testCaseIds: string[]) => Promise<void>;
  removeTestCasesFromTestPlan: (testPlanId: string, testCaseIds: string[]) => Promise<void>;
  
  // Individual Test Case Actions
  fetchTestCases: (page?: number, limit?: number, filters?: Record<string, string>) => Promise<any>;
  fetchTestCase: (id: string) => Promise<TestCase | null>;
  addTestCase: (testCase: Omit<TestCase, "id">) => Promise<TestCase>;
  updateTestCase: (id: string, updates: Partial<TestCase>) => Promise<TestCase>;
  deleteTestCase: (id: string) => Promise<void>;
  executeTestCase: (id: string, executionData: any) => Promise<TestCase>;
}

export const useApiStore = create<ApiStore>()(
  persist(
    (set, get) => ({
      // Initial state
      testPlans: [],
      testCases: [],
      testCase: null,
      isLoading: false,
      error: null,

      // Test Plan Actions
      fetchTestPlans: async (page = 1, limit = 20, filters = {}) => {
        set({ isLoading: true, error: null });
        try {
          const response = await testPlanService.fetchTestPlans(page, limit, filters);
          const testPlans = response.testPlans.map(testPlanService.apiToStoreTestPlan);
          set({ testPlans, isLoading: false });
        } catch (error) {
          console.error("Error fetching test plans:", error);
          set({ error: "Failed to fetch test plans", isLoading: false });
        }
      },

      fetchTestPlanById: async (id) => {
        console.log('ApiStore: fetchTestPlanById called with ID:', id);
        set({ isLoading: true, error: null });
        try {
          const apiTestPlan = await testPlanService.fetchTestPlanById(id);
          console.log('ApiStore: Received API test plan:', apiTestPlan);
          const testPlan = testPlanService.apiToStoreTestPlan(apiTestPlan);
          console.log('ApiStore: Converted to store format:', testPlan);
          
          // Update the test plans array with this test plan
          set((state) => ({
            testPlans: state.testPlans.some(tp => tp.id === id)
              ? state.testPlans.map(tp => tp.id === id ? testPlan : tp)
              : [...state.testPlans, testPlan],
            isLoading: false,
          }));
          
          return testPlan;
        } catch (error) {
          console.error("ApiStore: Error fetching test plan:", error);
          set({ error: "Failed to fetch test plan", isLoading: false });
          return null;
        }
      },

      addTestPlan: async (testPlanData) => {
        console.log('ApiStore: addTestPlan called with:', testPlanData);
        set({ isLoading: true, error: null });
        try {
          console.log('ApiStore: Calling testPlanService.createTestPlan');
          const apiTestPlan = await testPlanService.createTestPlan(testPlanData);
          console.log('ApiStore: Received API response:', apiTestPlan);
          const testPlan = testPlanService.apiToStoreTestPlan(apiTestPlan);
          console.log('ApiStore: Converted to store format:', testPlan);
          set((state) => ({
            testPlans: [...state.testPlans, testPlan],
            isLoading: false,
          }));
          console.log('ApiStore: Test plan added to store successfully');
          return testPlan;
        } catch (error) {
          console.error("ApiStore: Error creating test plan:", error);
          set({ error: "Failed to create test plan", isLoading: false });
          throw error;
        }
      },

      updateTestPlan: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const apiTestPlan = await testPlanService.updateTestPlan(id, updates);
          const testPlan = testPlanService.apiToStoreTestPlan(apiTestPlan);
          set((state) => ({
            testPlans: state.testPlans.map((tp) =>
              tp.id === id ? testPlan : tp
            ),
            isLoading: false,
          }));
          return testPlan;
        } catch (error) {
          console.error("Error updating test plan:", error);
          set({ error: "Failed to update test plan", isLoading: false });
          throw error;
        }
      },

      deleteTestPlan: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await testPlanService.deleteTestPlan(id);
          set((state) => ({
            testPlans: state.testPlans.filter((tp) => tp.id !== id),
            isLoading: false,
          }));
        } catch (error) {
          console.error("Error deleting test plan:", error);
          set({ error: "Failed to delete test plan", isLoading: false });
          throw error;
        }
      },

      executeTestPlan: async (id, status, testCaseResults) => {
        set({ isLoading: true, error: null });
        try {
          const apiTestPlan = await testPlanService.executeTestPlan(id, status, testCaseResults);
          const testPlan = testPlanService.apiToStoreTestPlan(apiTestPlan);
          set((state) => ({
            testPlans: state.testPlans.map((tp) =>
              tp.id === id ? testPlan : tp
            ),
            isLoading: false,
          }));
          return testPlan;
        } catch (error) {
          console.error("Error executing test plan:", error);
          set({ error: "Failed to execute test plan", isLoading: false });
          throw error;
        }
      },

      // Test Case Actions for Test Plans
      fetchTestCasesForTestPlan: async (testPlanId, page = 1, limit = 50) => {
        set({ isLoading: true, error: null });
        try {
          const response = await testPlanService.fetchTestCasesForTestPlan(testPlanId, page, limit);
          
          // Convert API test cases to store format
          const newTestCases = response.testCases.map(apiTestCase => ({
            id: apiTestCase.id,
            title: apiTestCase.title,
            description: apiTestCase.description || "",
            type: apiTestCase.type as "Manual" | "Automated" | "Exploratory" | "Regression",
            steps: apiTestCase.steps || [],
            expectedResult: apiTestCase.expected_result || "",
            actualResult: apiTestCase.actual_result || "",
            status: apiTestCase.status as "Not Executed" | "Passed" | "Failed" | "Blocked" | "Skipped",
            priority: apiTestCase.priority as "Low" | "Medium" | "High" | "Critical",
            linkedTicketIds: apiTestCase.linked_task && apiTestCase.linked_task.id ? [apiTestCase.linked_task.id] : [],
            linkedTickets: apiTestCase.linked_task && apiTestCase.linked_task.id ? [apiTestCase.linked_task.id] : [],
            assigneeId: apiTestCase.assigned_to || "",
            executedBy: apiTestCase.last_executed_by || "",
            executedAt: apiTestCase.last_executed ? new Date(apiTestCase.last_executed) : undefined,
            estimatedTime: apiTestCase.estimated_time || 0,
            actualTime: apiTestCase.actual_time || 0,
            environment: apiTestCase.environment || "",
            preconditions: apiTestCase.preconditions || "",
            prerequisites: apiTestCase.prerequisites || "",
            tags: apiTestCase.tags || [],
            ticketId: apiTestCase.ticket_id || "",
            testPlanId: apiTestCase.test_plan_id || "",
            automationScript: apiTestCase.automation_script || "",
            createdAt: apiTestCase.created_at ? new Date(apiTestCase.created_at) : undefined,
          }));
          
          // Update the test cases array by removing existing test cases for this test plan
          // and adding the new ones to prevent duplicates
          set((state) => {
            const filteredTestCases = state.testCases.filter(tc => tc.testPlanId !== testPlanId);
            return {
              testCases: [...filteredTestCases, ...newTestCases],
              isLoading: false,
            };
          });
        } catch (error) {
          console.error("Error fetching test cases for test plan:", error);
          set({ error: "Failed to fetch test cases", isLoading: false });
        }
      },

      addTestCasesToTestPlan: async (testPlanId, testCaseIds) => {
        set({ isLoading: true, error: null });
        try {
          const response = await testPlanService.updateTestPlanTestCases(testPlanId, testCaseIds, "add");
          
          // Update the test plan with the new execution summary
          set((state) => ({
            testPlans: state.testPlans.map((tp) =>
              tp.id === testPlanId
                ? { ...tp, executionSummary: response.executionSummary }
                : tp
            ),
            isLoading: false,
          }));
          
          // Fetch the updated test cases for this test plan
          await get().fetchTestCasesForTestPlan(testPlanId);
        } catch (error) {
          console.error("Error adding test cases to test plan:", error);
          set({ error: "Failed to add test cases to test plan", isLoading: false });
          throw error;
        }
      },

      removeTestCasesFromTestPlan: async (testPlanId, testCaseIds) => {
        set({ isLoading: true, error: null });
        try {
          const response = await testPlanService.updateTestPlanTestCases(testPlanId, testCaseIds, "remove");
          
          // Update the test plan with the new execution summary
          set((state) => ({
            testPlans: state.testPlans.map((tp) =>
              tp.id === testPlanId
                ? { ...tp, executionSummary: response.executionSummary }
                : tp
            ),
            // Remove the test cases from our local state
            testCases: state.testCases.filter(
              (tc) => !testCaseIds.includes(tc.id) || tc.testPlanId !== testPlanId
            ),
            isLoading: false,
          }));
        } catch (error) {
          console.error("Error removing test cases from test plan:", error);
          set({ error: "Failed to remove test cases from test plan", isLoading: false });
          throw error;
        }
      },

      // Individual Test Case Actions
      fetchTestCase: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/test-cases/${id}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch test case: ${response.statusText}`);
          }
          const testCase = await response.json();
          
          // Convert API response to store format
          const formattedTestCase: TestCase = {
            id: testCase.id,
            title: testCase.title,
            description: testCase.description || "",
            type: testCase.type as "Manual" | "Automated" | "Exploratory" | "Regression",
            steps: testCase.steps || [],
            expectedResult: testCase.expected_result || "",
            actualResult: testCase.actual_result || "",
            status: testCase.status as "Not Executed" | "Passed" | "Failed" | "Blocked" | "Skipped",
            priority: testCase.priority as "Low" | "Medium" | "High" | "Critical",
            linkedTicketIds: testCase.linked_task && testCase.linked_task.id ? [testCase.linked_task.id] : [],
            assigneeId: testCase.assigned_to || "",
            executedBy: testCase.last_executed_by || "",
            executedAt: testCase.last_executed ? new Date(testCase.last_executed) : undefined,
            estimatedTime: testCase.estimated_time || 0,
            actualTime: testCase.actual_time || 0,
            environment: testCase.environment || "",
            preconditions: testCase.preconditions || "",
            prerequisites: testCase.prerequisites || "",
            tags: testCase.tags || [],
            ticketId: testCase.ticket_id || "",
            testPlanId: testCase.test_plan_id || "",
            automationScript: testCase.automation_script || "",
            linkedTickets: testCase.linked_task && testCase.linked_task.id ? [testCase.linked_task.id] : []
          };
          
          set({ testCase: formattedTestCase, isLoading: false });
          return formattedTestCase;
        } catch (error) {
          console.error("Error fetching test case:", error);
          set({ error: "Failed to fetch test case", isLoading: false });
          return null;
        }
      },

      addTestCase: async (testCaseData) => {
        set({ isLoading: true, error: null });
        try {
          // Convert store format to API format
          const apiTestCase = {
            title: testCaseData.title,
            description: testCaseData.description,
            priority: testCaseData.priority,
            type: testCaseData.type,
            preconditions: testCaseData.preconditions,
            steps: testCaseData.steps,
            expectedResult: testCaseData.expectedResult,
            status: testCaseData.status,
            ticketId: testCaseData.ticketId,
            tags: testCaseData.tags,
            testPlanId: testCaseData.testPlanId,
          };

          const response = await fetch('/api/test-cases', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(apiTestCase),
          });

          if (!response.ok) {
            throw new Error(`Failed to create test case: ${response.statusText}`);
          }

          const createdTestCase = await response.json();
          
          // Convert API response to store format
          const formattedTestCase: TestCase = {
            id: createdTestCase.id,
            title: createdTestCase.title,
            description: createdTestCase.description || "",
            type: createdTestCase.type as "Manual" | "Automated" | "Exploratory" | "Regression",
            steps: createdTestCase.steps || [],
            expectedResult: createdTestCase.expected_result || "",
            actualResult: createdTestCase.actual_result || "",
            status: createdTestCase.status as "Not Executed" | "Passed" | "Failed" | "Blocked" | "Skipped",
            priority: createdTestCase.priority as "Low" | "Medium" | "High" | "Critical",
            linkedTicketIds: createdTestCase.linked_task && createdTestCase.linked_task.id ? [createdTestCase.linked_task.id] : [],
            assigneeId: createdTestCase.assigned_to || "",
            executedBy: createdTestCase.last_executed_by || "",
            executedAt: createdTestCase.last_executed ? new Date(createdTestCase.last_executed) : undefined,
            estimatedTime: createdTestCase.estimated_time || 0,
            actualTime: createdTestCase.actual_time || 0,
            environment: createdTestCase.environment || "",
            preconditions: createdTestCase.preconditions || "",
            prerequisites: createdTestCase.prerequisites || "",
            tags: createdTestCase.tags || [],
            ticketId: createdTestCase.ticket_id || "",
            testPlanId: createdTestCase.test_plan_id || "",
            automationScript: createdTestCase.automation_script || "",
            linkedTickets: createdTestCase.linked_task && createdTestCase.linked_task.id ? [createdTestCase.linked_task.id] : []
          };
          
          set((state) => ({
            testCases: [...state.testCases, formattedTestCase],
            testCase: formattedTestCase,
            isLoading: false,
          }));
          
          return formattedTestCase;
        } catch (error) {
          console.error("Error creating test case:", error);
          set({ error: "Failed to create test case", isLoading: false });
          throw error;
        }
      },

      updateTestCase: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          // Convert store format to API format
          const apiUpdates = {
            title: updates.title,
            description: updates.description,
            priority: updates.priority,
            type: updates.type,
            preconditions: updates.preconditions,
            steps: updates.steps,
            expectedResult: updates.expectedResult,
            status: updates.status,
            ticketId: updates.ticketId,
            tags: updates.tags,
            testPlanId: updates.testPlanId,
          };

          const response = await fetch(`/api/test-cases/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(apiUpdates),
          });

          if (!response.ok) {
            throw new Error(`Failed to update test case: ${response.statusText}`);
          }

          const updatedTestCase = await response.json();
          
          // Convert API response to store format
          const formattedTestCase: TestCase = {
            id: updatedTestCase.id,
            title: updatedTestCase.title,
            description: updatedTestCase.description || "",
            type: updatedTestCase.type,
            steps: updatedTestCase.steps || [],
            expectedResult: updatedTestCase.expected_result || "",
            actualResult: updatedTestCase.actual_result || "",
            status: updatedTestCase.status,
            priority: updatedTestCase.priority,
            linkedTicketIds: updatedTestCase.linked_task ? [updatedTestCase.linked_task.id] : [],
            assigneeId: updatedTestCase.assigned_to || "",
            executedBy: updatedTestCase.last_executed_by || "",
            executedAt: updatedTestCase.last_executed ? new Date(updatedTestCase.last_executed) : undefined,
            estimatedTime: updatedTestCase.estimated_time || 0,
            actualTime: updatedTestCase.actual_time || 0,
            environment: updatedTestCase.environment || "",
            preconditions: updatedTestCase.preconditions || "",
            prerequisites: updatedTestCase.prerequisites || "",
            tags: updatedTestCase.tags || [],
            ticketId: updatedTestCase.ticket_id || "",
            testPlanId: updatedTestCase.test_plan_id || "",
            automationScript: updatedTestCase.automation_script || "",
            linkedTickets: updatedTestCase.linked_task ? [updatedTestCase.linked_task.id] : []
          };
          
          set((state) => ({
            testCases: state.testCases.map((tc) =>
              tc.id === id ? formattedTestCase : tc
            ),
            testCase: formattedTestCase,
            isLoading: false,
          }));
          
          return formattedTestCase;
        } catch (error) {
          console.error("Error updating test case:", error);
          set({ error: "Failed to update test case", isLoading: false });
          throw error;
        }
      },

      deleteTestCase: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/test-cases/${id}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            throw new Error(`Failed to delete test case: ${response.statusText}`);
          }

          set((state) => ({
            testCases: state.testCases.filter((tc) => tc.id !== id),
            testCase: state.testCase?.id === id ? null : state.testCase,
            isLoading: false,
          }));
        } catch (error) {
          console.error("Error deleting test case:", error);
          set({ error: "Failed to delete test case", isLoading: false });
          throw error;
        }
      },

      fetchTestCases: async (page = 1, limit = 20, filters = {}) => {
        set({ isLoading: true, error: null });
        try {
          const params = new URLSearchParams({ page: String(page), limit: String(limit), ...filters });
          const response = await fetch(`/api/test-cases?${params.toString()}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch test cases: ${response.statusText}`);
          }
          const result = await response.json();
          // Map API fields to camelCase for all test cases
          const testCases = result.testCases.map((apiTestCase: any) => ({
            id: apiTestCase.id,
            title: apiTestCase.title,
            description: apiTestCase.description || "",
            type: apiTestCase.type,
            steps: apiTestCase.steps || [],
            expectedResult: apiTestCase.expected_result || "",
            actualResult: apiTestCase.actual_result || "",
            status: apiTestCase.status,
            priority: apiTestCase.priority,
            linkedTicketIds: apiTestCase.linked_task ? [apiTestCase.linked_task.id] : [],
            assigneeId: apiTestCase.assigned_to || "",
            executedBy: apiTestCase.last_executed_by || "",
            executedAt: apiTestCase.last_executed ? new Date(apiTestCase.last_executed) : undefined,
            estimatedTime: apiTestCase.estimated_time || 0,
            actualTime: apiTestCase.actual_time || 0,
            environment: apiTestCase.environment || "",
            preconditions: apiTestCase.preconditions || "",
            prerequisites: apiTestCase.prerequisites || "",
            tags: apiTestCase.tags || [],
            ticketId: apiTestCase.ticket_id || "",
            testPlanId: apiTestCase.test_plan_id || "",
            automationScript: apiTestCase.automation_script || "",
            createdAt: apiTestCase.created_at ? new Date(apiTestCase.created_at) : undefined,
          }));
          set({ testCases, isLoading: false });
          return { testCases, pagination: result.pagination };
        } catch (error) {
          console.error("Error fetching test cases:", error);
          set({ error: "Failed to fetch test cases", isLoading: false });
        }
      },
      
      executeTestCase: async (id, executionData) => {
        set({ isLoading: true, error: null });
        try {
          // Ensure we're sending the correct format to the API
          const apiExecutionData = {
            status: executionData.status,
            notes: executionData.notes,
            bug_report: executionData.bug_report
          };

          const response = await fetch(`/api/test-cases/${id}/execute`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(apiExecutionData),
          });

          if (!response.ok) {
            throw new Error(`Failed to execute test case: ${response.statusText}`);
          }

          const updatedTestCase = await response.json();
          
          // Convert API response to store format
          const formattedTestCase: TestCase = {
            id: updatedTestCase.id,
            title: updatedTestCase.title,
            description: updatedTestCase.description || "",
            type: updatedTestCase.type,
            steps: updatedTestCase.steps || [],
            expectedResult: updatedTestCase.expected_result || "",
            actualResult: executionData.actualResult || "",
            status: updatedTestCase.status,
            priority: updatedTestCase.priority,
            linkedTicketIds: updatedTestCase.linked_task ? [updatedTestCase.linked_task.id] : [],
            assigneeId: updatedTestCase.assigned_to || "",
            executedBy: updatedTestCase.last_executed_by || "",
            executedAt: updatedTestCase.last_executed ? new Date(updatedTestCase.last_executed) : undefined,
            estimatedTime: updatedTestCase.estimated_time || 0,
            actualTime: updatedTestCase.actual_time || 0,
            environment: updatedTestCase.environment || "",
            preconditions: updatedTestCase.preconditions || "",
            prerequisites: updatedTestCase.prerequisites || "",
            tags: updatedTestCase.tags || [],
            ticketId: updatedTestCase.ticket_id || "",
            testPlanId: updatedTestCase.test_plan_id || "",
            automationScript: updatedTestCase.automation_script || "",
            // Add execution history if available
            executions: updatedTestCase.test_executions?.map((execution: any) => ({
              id: execution.id,
              status: execution.status,
              notes: execution.notes,
              executedAt: execution.execution_date ? new Date(execution.execution_date) : new Date(),
              executedBy: execution.executed_by,
              bugReport: execution.created_bug ? {
                id: execution.created_bug.id,
                title: execution.created_bug.title,
                status: execution.created_bug.status,
              } : undefined,
            })) || [],
            linkedTickets: updatedTestCase.linked_task ? [updatedTestCase.linked_task.id] : []
          };
          
          set((state) => ({
            testCases: state.testCases.map((tc) =>
              tc.id === id ? formattedTestCase : tc
            ),
            testCase: formattedTestCase,
            isLoading: false,
          }));
          
          return formattedTestCase;
        } catch (error) {
          console.error("Error executing test case:", error);
          set({ error: "Failed to execute test case", isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: "api-store",
      partialize: (state) => ({
        // Persist test plans and test cases to avoid losing data on refresh
        testPlans: state.testPlans,
        testCases: state.testCases,
        testCase: state.testCase,
      }),
    }
  )
);