import { Workflow, TeamMember, Task, TaskStatus } from '@/store/useStore';

// Initial data for team members (without id, as it will be auto-generated)
export const initialTeamMembers: Omit<TeamMember, 'id'>[] = [
  {
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'QA Engineer',
    image: undefined,
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'Developer',
    image: undefined,
  },
  {
    name: 'Michael Johnson',
    email: 'michael.johnson@example.com',
    role: 'Product Manager',
    image: undefined,
  },
];

// Initial data for workflows
export const initialWorkflows = [
  {
    id: 'wf1',
    name: 'Login Feature Testing',
    description: 'Test cases for the login functionality',
    owner: '', // Will be assigned dynamically
    collaborators: [], // Will be assigned dynamically
    tasks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'wf2',
    name: 'User Registration Flow',
    description: 'Validate the user registration process',
    owner: '', // Will be assigned dynamically
    collaborators: [], // Will be assigned dynamically
    tasks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Initial data for tasks
export const initialTasks = [
  {
    id: 'task1',
    title: 'Create login test cases',
    description: 'Define test cases for login functionality',
    status: 'Todo',
    priority: 'High',
    workflowId: 'wf1', // Related to Login Feature Testing
    assignee: '', // Will be assigned dynamically
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    comments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task2',
    title: 'Execute login tests',
    description: 'Run the defined test cases for login',
    status: 'Todo',
    priority: 'Medium',
    workflowId: 'wf1', // Related to Login Feature Testing
    assignee: '', // Will be assigned dynamically
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    comments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task3',
    title: 'Create registration test cases',
    description: 'Define test cases for user registration',
    status: 'Todo',
    priority: 'High',
    workflowId: 'wf2', // Related to User Registration Flow
    assignee: '', // Will be assigned dynamically
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    comments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
