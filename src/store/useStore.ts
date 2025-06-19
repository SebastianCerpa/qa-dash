'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Define test types
export type TestType =
  | 'Positive'
  | 'Negative'
  | 'Functional'
  | 'Non-functional'
  | 'Regression'
  | 'API'
  | 'Exploratory'
  | 'Boundary'
  | 'Smoke'
  | 'Stress'
  | 'Accessibility';

// Define task status
export type TaskStatus = 'Todo' | 'In Progress' | 'Review' | 'Done';

// Define task priority
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';

// Define comment interface
export interface Comment {
  id: string;
  content: string;
  author: string;
  createdAt: string;
}

// Define task interface
export interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  testType: TestType;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  attachments?: string[];
  comments?: Comment[];
}

// Define workflow interface
export interface Workflow {
  id: string;
  name: string;
  description: string;
  tasks: string[];
  createdAt: string;
  updatedAt: string;
  owner: string;
  collaborators: string[];
}

// Define team member interface
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

// Define store interface
interface StoreState {
  tasks: Task[];
  workflows: Workflow[];
  teamMembers: TeamMember[];
  currentUser: TeamMember | null;
  // Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addWorkflow: (workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateWorkflow: (id: string, workflow: Partial<Workflow>) => void;
  deleteWorkflow: (id: string) => void;
  addTeamMember: (member: Omit<TeamMember, 'id'>) => void;
  updateTeamMember: (id: string, member: Partial<TeamMember>) => void;
  deleteTeamMember: (id: string) => void;
  setCurrentUser: (user: TeamMember | null) => void;
  addComment: (taskId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => void;
}

// Create the store
export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      tasks: [],
      workflows: [],
      teamMembers: [],
      currentUser: null,

      // Task actions
      addTask: (task) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              ...task,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              comments: [],
            },
          ],
        })),

      updateTask: (id, updatedTask) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, ...updatedTask, updatedAt: new Date().toISOString() }
              : task
          ),
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
          workflows: state.workflows.map((workflow) => ({
            ...workflow,
            tasks: workflow.tasks.filter((taskId) => taskId !== id),
          })),
        })),

      // Workflow actions
      addWorkflow: (workflow) =>
        set((state) => ({
          workflows: [
            ...state.workflows,
            {
              ...workflow,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),

      updateWorkflow: (id, updatedWorkflow) =>
        set((state) => ({
          workflows: state.workflows.map((workflow) =>
            workflow.id === id
              ? {
                  ...workflow,
                  ...updatedWorkflow,
                  updatedAt: new Date().toISOString(),
                }
              : workflow
          ),
        })),

      deleteWorkflow: (id) =>
        set((state) => ({
          workflows: state.workflows.filter((workflow) => workflow.id !== id),
        })),

      // Team member actions
      addTeamMember: (member) =>
        set((state) => ({
          teamMembers: [
            ...state.teamMembers,
            {
              ...member,
              id: crypto.randomUUID(),
            },
          ],
        })),

      updateTeamMember: (id, updatedMember) =>
        set((state) => ({
          teamMembers: state.teamMembers.map((member) =>
            member.id === id ? { ...member, ...updatedMember } : member
          ),
        })),

      deleteTeamMember: (id) =>
        set((state) => ({
          teamMembers: state.teamMembers.filter((member) => member.id !== id),
        })),

      // Current user
      setCurrentUser: (user) => set({ currentUser: user }),

      // Comments
      addComment: (taskId, comment) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  comments: [
                    ...(task.comments || []),
                    {
                      ...comment,
                      id: crypto.randomUUID(),
                      createdAt: new Date().toISOString(),
                    },
                  ],
                }
              : task
          ),
        })),
    }),
    {
      name: 'qa-dashboard-storage',
      // 💡 Este check asegura que localStorage solo se use en el cliente
      storage: typeof window !== 'undefined' ? createJSONStorage(() => localStorage) : undefined,

    }
  )
);
