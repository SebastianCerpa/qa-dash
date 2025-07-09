import { Workflow, TeamMember, Task, TaskStatus } from '@/store/useStore';

// Datos iniciales para miembros del equipo
export const initialTeamMembers = [
  {
    id: 'tm1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'QA Engineer',
  },
  {
    id: 'tm2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'Developer',
  },
  {
    id: 'tm3',
    name: 'Michael Johnson',
    email: 'michael.johnson@example.com',
    role: 'Product Manager',
  },
];

// Datos iniciales para flujos de trabajo
export const initialWorkflows = [
  {
    id: 'wf1',
    name: 'Login Feature Testing',
    description: 'Test cases for the login functionality',
    owner: '', // Se asignará dinámicamente
    collaborators: [], // Se asignarán dinámicamente
    tasks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'wf2',
    name: 'User Registration Flow',
    description: 'Validate the user registration process',
    owner: '', // Se asignará dinámicamente
    collaborators: [], // Se asignarán dinámicamente
    tasks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Datos iniciales para tareas
export const initialTasks = [
  {
    id: 'task1',
    title: 'Create login test cases',
    description: 'Define test cases for login functionality',
    status: 'Todo',
    priority: 'High',
    workflowId: 'wf1', // Relacionado con Login Feature Testing
    assignee: '', // Se asignará dinámicamente
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
    workflowId: 'wf1', // Relacionado con Login Feature Testing
    assignee: '', // Se asignará dinámicamente
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
    workflowId: 'wf2', // Relacionado con User Registration Flow
    assignee: '', // Se asignará dinámicamente
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    comments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];