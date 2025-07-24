'use client';

import { useEffect, useState } from 'react';
import { useStore, TaskStatus, TaskPriority } from '@/store/useStore';
import { initialTeamMembers, initialWorkflows, initialTasks } from '@/data/initialData';

// Custom hook that handles data initialization safely
function useClientSideDataInitialization() {
  const [isClient, setIsClient] = useState(false);
  const [initialized, setInitialized] = useState(false);
  
  const {
    teamMembers,
    workflows,
    tasks,
    addTeamMember,
    addWorkflow,
    addTask,
    updateWorkflow
  } = useStore();
  
  // Verify we are on the client
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Initialize data only on client
  useEffect(() => {
    if (!isClient || initialized || typeof window === 'undefined') return;
    
    const shouldSeedData = teamMembers.length === 0 && workflows.length === 0;
    
    if (shouldSeedData) {
      console.log('Initializing test data...');
      
      // Step 1: Add team members
      initialTeamMembers.forEach((member) => {
        addTeamMember(member);
      });
      
      // Use setTimeout to ensure team members are added before proceeding
      setTimeout(() => {
        const currentTeamMembers = useStore.getState().teamMembers;
        const teamMemberIds = currentTeamMembers.slice(-initialTeamMembers.length).map(m => m.id);

        // Step 2: Add workflows with assigned owners
        initialWorkflows.forEach((workflow, index) => {
          const ownerIndex = index % teamMemberIds.length;
          const collaboratorIndices = teamMemberIds
            .map((_, i) => i)
            .filter((i) => i !== ownerIndex)
            .slice(0, 2);
            
          const workflowWithOwner = {
            ...workflow,
            owner: teamMemberIds[ownerIndex],
            collaborators: collaboratorIndices.map((i) => teamMemberIds[i]),
          };
          
          addWorkflow(workflowWithOwner);
        });
        
        // Step 3: Add tasks and assign them to workflows
        setTimeout(() => {
          const currentWorkflows = useStore.getState().workflows;
          const workflowIds = currentWorkflows.slice(-initialWorkflows.length).map(w => w.id);
          
          initialTasks.forEach((task, index) => {
            const workflowIndex = index % workflowIds.length;
            const assigneeIndex = index % teamMemberIds.length;
            
            const taskWithAssignments = {
              title: task.title,
              description: task.description,
              assignee: teamMemberIds[assigneeIndex],
              testType: 'Functional' as const,
              status: task.status as TaskStatus,
              priority: task.priority as TaskPriority,
              dueDate: task.dueDate,
            };
            
            addTask(taskWithAssignments);
          });
          
          // Step 4: Update workflows to include tasks
          setTimeout(() => {
            const currentTasks = useStore.getState().tasks;
            const taskIds = currentTasks.slice(-initialTasks.length).map(t => t.id);
            
            initialTasks.forEach((task, index) => {
              const workflowIndex = index % workflowIds.length;
              const taskId = taskIds[index];
              const workflowId = workflowIds[workflowIndex];
              
              const currentWorkflows = useStore.getState().workflows;
              const workflow = currentWorkflows.find((w) => w.id === workflowId);
              if (workflow && taskId) {
                updateWorkflow(workflow.id, {
                  ...workflow,
                  tasks: [...workflow.tasks, taskId],
                });
              }
            });
            
            setInitialized(true);
          }, 0);
        }, 0);
      }, 0);
    }
  }, [isClient, initialized, teamMembers.length, workflows.length, addTeamMember, addWorkflow, addTask, updateWorkflow]);
}

// Separate component to initialize data
function DataInitializer() {
  useClientSideDataInitialization();
  return null;
}

export default function DataProvider({ children }: { children: React.ReactNode }) {
  // State to control if we are on the client
  const [isClient, setIsClient] = useState(false);
  
  // Check if we are on the client
  useEffect(() => {
    // Use a small delay to ensure hydration is complete
    const timer = setTimeout(() => {
      setIsClient(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {isClient && <DataInitializer />}
      {children}
    </>
  );
}
