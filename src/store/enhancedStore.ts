import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Enhanced interfaces for comprehensive QA management
export interface QATicket {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string; // Markdown or BDD format
  status: 'Open' | 'In Progress' | 'Testing' | 'Review' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  tags: string[];
  sprintId?: string;
  assigneeId?: string;
  reporterId: string;
  linkedTestCases: string[];
  createdAt: Date;
  updatedAt: Date;
  estimatedHours?: number;
  actualHours?: number;
  attachments: string[];
}

export interface Sprint {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: 'Planning' | 'Active' | 'Completed' | 'Cancelled';
  goals: string[];
  specifications: ProductSpecification[];
  ticketIds: string[];
  velocity: number;
  burndownData: { date: Date; remaining: number }[];
}

export interface ProductSpecification {
  id: string;
  title: string;
  description: string;
  version: string;
  pmId: string;
  attachedFiles: string[];
  createdAt: Date;
  sprintId: string;
}

export interface TestCase {
  id: string;
  title: string;
  description: string;
  type: 'Manual' | 'Automated' | 'Exploratory' | 'Regression';
  steps: TestStep[];
  expectedResult: string;
  actualResult?: string;
  status: 'Not Executed' | 'Passed' | 'Failed' | 'Blocked' | 'Skipped';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  linkedTicketIds: string[];
  assigneeId?: string;
  executedBy?: string;
  executedAt?: Date;
  estimatedTime: number;
  actualTime?: number;
  environment: string;
  prerequisites: string;
  tags: string[];
  automationScript?: string;
  ciIntegration?: {
    buildId: string;
    pipelineUrl: string;
    executionTime: number;
  };
}

export interface TestStep {
  id: string;
  stepNumber: number;
  action: string;
  expectedResult: string;
  actualResult?: string;
  status?: 'Passed' | 'Failed' | 'Skipped';
  screenshot?: string;
}

export interface TestPlan {
  id: string;
  name: string;
  description: string;
  testCaseIds: string[];
  sprintId?: string;
  status: 'Draft' | 'Active' | 'Completed';
  createdBy: string;
  createdAt: Date;
  executionSummary?: {
    totalTests: number;
    passed: number;
    failed: number;
    blocked: number;
    skipped: number;
    executionRate: number;
  };
}

export interface Task {
  id: string;
  title: string;
  description: string;
  type: 'Testing' | 'Bug Fix' | 'Documentation' | 'Review' | 'Planning' | 'Other';
  status: 'Todo' | 'In Progress' | 'Review' | 'Done';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  assigneeId?: string;
  reporterId: string;
  dueDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  linkedTicketId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'QA Engineer' | 'Senior QA Engineer' | 'QA Lead' | 'QA Manager' | 'Developer' | 'Product Manager' | 'Admin';
  avatar?: string;
  permissions: Permission[];
  isActive: boolean;
  lastLogin?: Date;
  preferences: {
    theme: 'light' | 'dark';
    notifications: {
      email: boolean;
      inApp: boolean;
      slack: boolean;
    };
    timezone: string;
  };
}

export interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: string;
  timestamp: Date;
  ipAddress?: string;
}

export interface Metric {
  id: string;
  name: string;
  value: number;
  unit: string;
  category: 'Bug' | 'Test' | 'Sprint' | 'User' | 'Performance';
  period: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly';
  date: Date;
  metadata?: Record<string, any>;
}

export interface Integration {
  id: string;
  name: string;
  type: 'Jira' | 'GitHub' | 'Slack' | 'TestRail' | 'CI/CD';
  config: Record<string, any>;
  isActive: boolean;
  lastSync?: Date;
}

export interface AIInsight {
  id: string;
  type: 'Acceptance Criteria' | 'Test Cases' | 'Bug Pattern' | 'Sprint Prediction';
  content: string;
  confidence: number;
  relatedResourceId: string;
  createdAt: Date;
  isApplied: boolean;
}

// Enhanced Bug Management Interfaces
export interface BugReport {
  id: string;
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'BLOCKER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REOPENED';
  project_id: string;
  reporter_id: string;
  assignee_id?: string;
  environment?: string;
  browser?: string;
  os?: string;
  version?: string;
  steps_to_reproduce?: string;
  expected_behavior?: string;
  actual_behavior?: string;
  labels: string[];
  is_regression: boolean;
  related_test_case_id?: string;
  regression_version?: string;
  custom_fields: CustomField[];
  created_at: Date;
  updated_at: Date;
  resolved_at?: Date;
  attachments: BugAttachment[];
  screenshots: BugScreenshot[];
  comments: BugComment[];
  activities: BugActivity[];
}

export interface CustomField {
  id: string;
  name: string;
  value: string;
  type: 'text' | 'number' | 'select' | 'boolean';
  options?: string[];
}

export interface BugAttachment {
  id: string;
  bug_id: string;
  filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by: string;
  uploaded_at: Date;
}

export interface BugScreenshot {
  id: string;
  bug_id: string;
  filename: string;
  file_path: string;
  file_size: number;
  uploaded_by: string;
  uploaded_at: Date;
}

export interface BugComment {
  id: string;
  bug_id: string;
  user_id: string;
  content: string;
  created_at: Date;
  updated_at: Date;
}

export interface BugActivity {
  id: string;
  bug_id: string;
  user_id?: string;
  action: string;
  details: Record<string, any>;
  created_at: Date;
}

export interface TestExecution {
  id: string;
  test_case_name: string;
  test_suite_id: string;
  status: 'PASSED' | 'FAILED' | 'SKIPPED';
  duration: number;
  executed_at: Date;
  build_id?: string;
  branch?: string;
  commit_hash?: string;
  environment?: string;
  error_message?: string;
  stack_trace?: string;
  is_flaky: boolean;
  flaky_score: number;
  retry_count: number;
}

export interface BugAnalytics {
  id: string;
  date: Date;
  total_bugs: number;
  new_bugs: number;
  resolved_bugs: number;
  critical_bugs: number;
  regression_bugs: number;
  avg_resolution_time: number;
  bugs_by_severity: Record<string, number>;
  bugs_by_status: Record<string, number>;
  top_reporters: Array<{ user_id: string; count: number }>;
  top_assignees: Array<{ user_id: string; count: number }>;
}

export interface WorkflowRule {
  id: string;
  name: string;
  description?: string;
  trigger_event: string;
  conditions: Record<string, any>;
  actions: Record<string, any>;
  is_active: boolean;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, any>;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  is_read: boolean;
  read_at?: Date;
  expires_at?: Date;
  created_at: Date;
}

interface EnhancedQAStore {
  // State
  tickets: QATicket[];
  sprints: Sprint[];
  specifications: ProductSpecification[];
  testCases: TestCase[];
  testPlans: TestPlan[];
  tasks: Task[];
  users: User[];
  activityLogs: ActivityLog[];
  metrics: Metric[];
  integrations: Integration[];
  aiInsights: AIInsight[];
  currentUser: User | null;
  
  // Bug Management State
  bugReports: BugReport[];
  testExecutions: TestExecution[];
  bugAnalytics: BugAnalytics[];
  workflowRules: WorkflowRule[];
  notifications: Notification[];
  
  // Ticket Management
  addTicket: (ticket: Omit<QATicket, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTicket: (id: string, updates: Partial<QATicket>) => void;
  deleteTicket: (id: string) => void;
  linkTestCaseToTicket: (ticketId: string, testCaseId: string) => void;
  
  // Sprint Management
  addSprint: (sprint: Omit<Sprint, 'id'>) => void;
  updateSprint: (id: string, updates: Partial<Sprint>) => void;
  deleteSprint: (id: string) => void;
  addTicketToSprint: (sprintId: string, ticketId: string) => void;
  
  // Test Management
  addTestCase: (testCase: Omit<TestCase, 'id'>) => void;
  updateTestCase: (id: string, updates: Partial<TestCase>) => void;
  deleteTestCase: (id: string) => void;
  executeTestCase: (id: string, result: Partial<TestCase>) => void;
  
  addTestPlan: (testPlan: Omit<TestPlan, 'id'>) => void;
  updateTestPlan: (id: string, updates: Partial<TestPlan>) => void;
  deleteTestPlan: (id: string) => void;
  
  // Task Management
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  
  // User Management
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  setCurrentUser: (user: User) => void;
  
  // Activity Logging
  logActivity: (activity: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
  
  // Metrics
  addMetric: (metric: Omit<Metric, 'id'>) => void;
  getMetricsByCategory: (category: Metric['category']) => Metric[];
  getMetricsByPeriod: (period: Metric['period'], startDate: Date, endDate: Date) => Metric[];
  
  // AI Insights
  addAIInsight: (insight: Omit<AIInsight, 'id' | 'createdAt'>) => void;
  applyAIInsight: (id: string) => void;
  
  // Integrations
  addIntegration: (integration: Omit<Integration, 'id'>) => void;
  updateIntegration: (id: string, updates: Partial<Integration>) => void;
  toggleIntegration: (id: string) => void;
  
  // Bug Management Actions
  addBugReport: (bug: Omit<BugReport, 'id' | 'created_at' | 'updated_at'>) => void;
  updateBugReport: (id: string, updates: Partial<BugReport>) => void;
  deleteBugReport: (id: string) => void;
  addBugComment: (bugId: string, comment: Omit<BugComment, 'id' | 'created_at' | 'updated_at'>) => void;
  addBugActivity: (bugId: string, activity: Omit<BugActivity, 'id' | 'created_at'>) => void;
  
  // Test Execution Management
  addTestExecution: (execution: Omit<TestExecution, 'id'>) => void;
  updateTestExecution: (id: string, updates: Partial<TestExecution>) => void;
  getFlakytests: () => TestExecution[];
  
  // Analytics
  updateBugAnalytics: (analytics: Omit<BugAnalytics, 'id'>) => void;
  getBugAnalyticsByDateRange: (startDate: Date, endDate: Date) => BugAnalytics[];
  
  // Workflow Rules
  addWorkflowRule: (rule: Omit<WorkflowRule, 'id' | 'created_at' | 'updated_at'>) => void;
  updateWorkflowRule: (id: string, updates: Partial<WorkflowRule>) => void;
  toggleWorkflowRule: (id: string) => void;
  
  // Notifications
  addNotification: (notification: Omit<Notification, 'id' | 'created_at'>) => void;
  markNotificationAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  getUnreadNotifications: () => Notification[];
}

export const useEnhancedQAStore = create<EnhancedQAStore>()(persist(
  (set, get) => ({
    // Initial state
    tickets: [],
    sprints: [],
    specifications: [],
    testCases: [],
    testPlans: [],
    tasks: [],
    users: [],
    activityLogs: [],
    metrics: [],
    integrations: [],
    aiInsights: [],
    currentUser: null,
    
    // Bug Management Initial State
    bugReports: [],
    testExecutions: [],
    bugAnalytics: [],
    workflowRules: [],
    notifications: [],
    
    // Ticket Management
    addTicket: (ticketData) => {
      const ticket: QATicket = {
        ...ticketData,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      set((state) => ({ tickets: [...state.tickets, ticket] }));
      get().logActivity({
        userId: get().currentUser?.id || 'system',
        action: 'Created ticket',
        resourceType: 'ticket',
        resourceId: ticket.id,
        details: `Created ticket: ${ticket.title}`,
      });
    },
    
    updateTicket: (id, updates) => {
      set((state) => ({
        tickets: state.tickets.map((ticket) =>
          ticket.id === id ? { ...ticket, ...updates, updatedAt: new Date() } : ticket
        ),
      }));
      get().logActivity({
        userId: get().currentUser?.id || 'system',
        action: 'Updated ticket',
        resourceType: 'ticket',
        resourceId: id,
        details: `Updated ticket with changes: ${Object.keys(updates).join(', ')}`,
      });
    },
    
    deleteTicket: (id) => {
      const ticket = get().tickets.find(t => t.id === id);
      set((state) => ({ tickets: state.tickets.filter((t) => t.id !== id) }));
      get().logActivity({
        userId: get().currentUser?.id || 'system',
        action: 'Deleted ticket',
        resourceType: 'ticket',
        resourceId: id,
        details: `Deleted ticket: ${ticket?.title}`,
      });
    },
    
    linkTestCaseToTicket: (ticketId, testCaseId) => {
      set((state) => ({
        tickets: state.tickets.map((ticket) =>
          ticket.id === ticketId
            ? { ...ticket, linkedTestCases: [...ticket.linkedTestCases, testCaseId] }
            : ticket
        ),
      }));
    },
    
    // Sprint Management
    addSprint: (sprintData) => {
      const sprint: Sprint = {
        ...sprintData,
        id: crypto.randomUUID(),
      };
      set((state) => ({ sprints: [...state.sprints, sprint] }));
    },
    
    updateSprint: (id, updates) => {
      set((state) => ({
        sprints: state.sprints.map((sprint) =>
          sprint.id === id ? { ...sprint, ...updates } : sprint
        ),
      }));
    },
    
    deleteSprint: (id) => {
      set((state) => ({ sprints: state.sprints.filter((s) => s.id !== id) }));
    },
    
    addTicketToSprint: (sprintId, ticketId) => {
      set((state) => ({
        sprints: state.sprints.map((sprint) =>
          sprint.id === sprintId
            ? { ...sprint, ticketIds: [...sprint.ticketIds, ticketId] }
            : sprint
        ),
        tickets: state.tickets.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, sprintId } : ticket
        ),
      }));
    },
    
    // Test Management
    addTestCase: (testCaseData) => {
      const testCase: TestCase = {
        ...testCaseData,
        id: crypto.randomUUID(),
      };
      set((state) => ({ testCases: [...state.testCases, testCase] }));
    },
    
    updateTestCase: (id, updates) => {
      set((state) => ({
        testCases: state.testCases.map((testCase) =>
          testCase.id === id ? { ...testCase, ...updates } : testCase
        ),
      }));
    },
    
    deleteTestCase: (id) => {
      set((state) => ({ testCases: state.testCases.filter((tc) => tc.id !== id) }));
    },
    
    executeTestCase: (id, result) => {
      set((state) => ({
        testCases: state.testCases.map((testCase) =>
          testCase.id === id
            ? {
                ...testCase,
                ...result,
                executedBy: get().currentUser?.id,
                executedAt: new Date(),
              }
            : testCase
        ),
      }));
    },
    
    addTestPlan: (testPlanData) => {
      const testPlan: TestPlan = {
        ...testPlanData,
        id: crypto.randomUUID(),
      };
      set((state) => ({ testPlans: [...state.testPlans, testPlan] }));
    },
    
    updateTestPlan: (id, updates) => {
      set((state) => ({
        testPlans: state.testPlans.map((testPlan) =>
          testPlan.id === id ? { ...testPlan, ...updates } : testPlan
        ),
      }));
    },
    
    deleteTestPlan: (id) => {
      set((state) => ({ testPlans: state.testPlans.filter((tp) => tp.id !== id) }));
    },
    
    // Task Management
    addTask: (taskData) => {
      const task: Task = {
        ...taskData,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      set((state) => ({ tasks: [...state.tasks, task] }));
    },
    
    updateTask: (id, updates) => {
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, ...updates, updatedAt: new Date() } : task
        ),
      }));
    },
    
    deleteTask: (id) => {
      set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
    },
    
    // User Management
    addUser: (userData) => {
      const user: User = {
        ...userData,
        id: crypto.randomUUID(),
      };
      set((state) => ({ users: [...state.users, user] }));
    },
    
    updateUser: (id, updates) => {
      set((state) => ({
        users: state.users.map((user) =>
          user.id === id ? { ...user, ...updates } : user
        ),
      }));
    },
    
    deleteUser: (id) => {
      set((state) => ({ users: state.users.filter((u) => u.id !== id) }));
    },
    
    setCurrentUser: (user) => {
      set({ currentUser: user });
    },
    
    // Activity Logging
    logActivity: (activityData) => {
      const activity: ActivityLog = {
        ...activityData,
        id: crypto.randomUUID(),
        timestamp: new Date(),
      };
      set((state) => ({ activityLogs: [...state.activityLogs, activity] }));
    },
    
    // Metrics
    addMetric: (metricData) => {
      const metric: Metric = {
        ...metricData,
        id: crypto.randomUUID(),
      };
      set((state) => ({ metrics: [...state.metrics, metric] }));
    },
    
    getMetricsByCategory: (category) => {
      return get().metrics.filter((metric) => metric.category === category);
    },
    
    getMetricsByPeriod: (period, startDate, endDate) => {
      return get().metrics.filter(
        (metric) =>
          metric.period === period &&
          metric.date >= startDate &&
          metric.date <= endDate
      );
    },
    
    // AI Insights
    addAIInsight: (insightData) => {
      const insight: AIInsight = {
        ...insightData,
        id: crypto.randomUUID(),
        createdAt: new Date(),
      };
      set((state) => ({ aiInsights: [...state.aiInsights, insight] }));
    },
    
    applyAIInsight: (id) => {
      set((state) => ({
        aiInsights: state.aiInsights.map((insight) =>
          insight.id === id ? { ...insight, isApplied: true } : insight
        ),
      }));
    },
    
    // Integrations
    addIntegration: (integrationData) => {
      const integration: Integration = {
        ...integrationData,
        id: crypto.randomUUID(),
      };
      set((state) => ({ integrations: [...state.integrations, integration] }));
    },
    
    updateIntegration: (id, updates) => {
      set((state) => ({
        integrations: state.integrations.map((integration) =>
          integration.id === id ? { ...integration, ...updates } : integration
        ),
      }));
    },
    
    toggleIntegration: (id) => {
      set((state) => ({
        integrations: state.integrations.map((integration) =>
          integration.id === id
            ? { ...integration, isActive: !integration.isActive }
            : integration
        ),
      }));
    },
    
    // Bug Management Actions Implementation
    addBugReport: (bugData) => {
      const bug: BugReport = {
        ...bugData,
        id: crypto.randomUUID(),
        created_at: new Date(),
        updated_at: new Date(),
        attachments: [],
        screenshots: [],
        comments: [],
        activities: [],
      };
      set((state) => ({ bugReports: [...state.bugReports, bug] }));
      get().logActivity({
        userId: get().currentUser?.id || 'system',
        action: 'Created bug report',
        resourceType: 'bug',
        resourceId: bug.id,
        details: `Created bug report: ${bug.title}`,
      });
    },
    
    updateBugReport: (id, updates) => {
      set((state) => ({
        bugReports: state.bugReports.map((bug) =>
          bug.id === id ? { ...bug, ...updates, updated_at: new Date() } : bug
        ),
      }));
      get().logActivity({
        userId: get().currentUser?.id || 'system',
        action: 'Updated bug report',
        resourceType: 'bug',
        resourceId: id,
        details: `Updated bug report: ${Object.keys(updates).join(', ')}`,
      });
    },
    
    deleteBugReport: (id) => {
      set((state) => ({
        bugReports: state.bugReports.filter((bug) => bug.id !== id),
      }));
      get().logActivity({
        userId: get().currentUser?.id || 'system',
        action: 'Deleted bug report',
        resourceType: 'bug',
        resourceId: id,
        details: 'Deleted bug report',
      });
    },
    
    addBugComment: (bugId, commentData) => {
      const comment: BugComment = {
        ...commentData,
        id: crypto.randomUUID(),
        bug_id: bugId,
        created_at: new Date(),
        updated_at: new Date(),
      };
      set((state) => ({
        bugReports: state.bugReports.map((bug) =>
          bug.id === bugId
            ? { ...bug, comments: [...bug.comments, comment] }
            : bug
        ),
      }));
    },
    
    addBugActivity: (bugId, activityData) => {
      const activity: BugActivity = {
        ...activityData,
        id: crypto.randomUUID(),
        bug_id: bugId,
        created_at: new Date(),
      };
      set((state) => ({
        bugReports: state.bugReports.map((bug) =>
          bug.id === bugId
            ? { ...bug, activities: [...bug.activities, activity] }
            : bug
        ),
      }));
    },
    
    // Test Execution Management
    addTestExecution: (executionData) => {
      const execution: TestExecution = {
        ...executionData,
        id: crypto.randomUUID(),
      };
      set((state) => ({ testExecutions: [...state.testExecutions, execution] }));
    },
    
    updateTestExecution: (id, updates) => {
      set((state) => ({
        testExecutions: state.testExecutions.map((execution) =>
          execution.id === id ? { ...execution, ...updates } : execution
        ),
      }));
    },
    
    getFlakytests: () => {
      return get().testExecutions.filter((execution) => execution.is_flaky);
    },
    
    // Analytics
    updateBugAnalytics: (analyticsData) => {
      const analytics: BugAnalytics = {
        ...analyticsData,
        id: crypto.randomUUID(),
      };
      set((state) => ({ bugAnalytics: [...state.bugAnalytics, analytics] }));
    },
    
    getBugAnalyticsByDateRange: (startDate, endDate) => {
      return get().bugAnalytics.filter(
        (analytics) => analytics.date >= startDate && analytics.date <= endDate
      );
    },
    
    // Workflow Rules
    addWorkflowRule: (ruleData) => {
      const rule: WorkflowRule = {
        ...ruleData,
        id: crypto.randomUUID(),
        created_at: new Date(),
        updated_at: new Date(),
      };
      set((state) => ({ workflowRules: [...state.workflowRules, rule] }));
    },
    
    updateWorkflowRule: (id, updates) => {
      set((state) => ({
        workflowRules: state.workflowRules.map((rule) =>
          rule.id === id ? { ...rule, ...updates, updated_at: new Date() } : rule
        ),
      }));
    },
    
    toggleWorkflowRule: (id) => {
      set((state) => ({
        workflowRules: state.workflowRules.map((rule) =>
          rule.id === id ? { ...rule, is_active: !rule.is_active } : rule
        ),
      }));
    },
    
    // Notifications
    addNotification: (notificationData) => {
      const notification: Notification = {
        ...notificationData,
        id: crypto.randomUUID(),
        created_at: new Date(),
      };
      set((state) => ({ notifications: [...state.notifications, notification] }));
    },
    
    markNotificationAsRead: (id) => {
      set((state) => ({
        notifications: state.notifications.map((notification) =>
          notification.id === id
            ? { ...notification, is_read: true, read_at: new Date() }
            : notification
        ),
      }));
    },
    
    deleteNotification: (id) => {
      set((state) => ({
        notifications: state.notifications.filter((notification) => notification.id !== id),
      }));
    },
    
    getUnreadNotifications: () => {
      return get().notifications.filter((notification) => !notification.is_read);
    },
  }),
  {
    name: 'enhanced-qa-store',
    partialize: (state) => ({
      tickets: state.tickets,
      sprints: state.sprints,
      specifications: state.specifications,
      testCases: state.testCases,
      testPlans: state.testPlans,
      tasks: state.tasks,
      users: state.users,
      metrics: state.metrics,
      integrations: state.integrations,
      currentUser: state.currentUser,
      bugReports: state.bugReports,
      testExecutions: state.testExecutions,
      bugAnalytics: state.bugAnalytics,
      workflowRules: state.workflowRules,
      notifications: state.notifications,
    }),
  }
));