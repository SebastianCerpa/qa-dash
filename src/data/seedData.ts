import { useStore, TaskStatus, TaskPriority } from '@/store/useStore';
import { initialTeamMembers, initialWorkflows, initialTasks } from './initialData';
import { useEffect, useState } from 'react';

/**
 * Hook to initialize test data in the application
 * Only runs on the client and when storage is empty
 */
export function useSeedData() {
  const {
    teamMembers,
    workflows,
    tasks,
    addTeamMember,
    addWorkflow,
    addTask,
    updateWorkflow
  } = useStore();

  // State to control if data has already been initialized
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Avoid initialization on server
    if (typeof window === 'undefined') return;

    // Only initialize data if no existing data and not initialized before
    const shouldSeedData = !initialized && teamMembers.length === 0 && workflows.length === 0;

    if (shouldSeedData) {
      console.log('Initializing test data...', { teamMembers, workflows });

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
          // Assign owner and collaborators
          const ownerIndex = index % teamMemberIds.length;
          const collaboratorIndices = teamMemberIds
            .map((_, i) => i)
            .filter((i) => i !== ownerIndex)
            .slice(0, 2); // Assign up to 2 collaborators

          const workflowWithOwner = {
            ...workflow,
            owner: teamMemberIds[ownerIndex],
            collaborators: collaboratorIndices.map((i) => teamMemberIds[i]),
          };

          // Add the workflow
          addWorkflow(workflowWithOwner);
        });

        // Step 3: Add tasks and assign them to workflows
        setTimeout(() => {
          const currentWorkflows = useStore.getState().workflows;
          const workflowIds = currentWorkflows.slice(-initialWorkflows.length).map(w => w.id);
          
          initialTasks.forEach((task, index) => {
            // Assign to a workflow
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

            // Add the task
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
            
            // Mark as initialized to avoid multiple initializations
            setInitialized(true);
          }, 0);
        }, 0);
      }, 0);
    }
  }, [teamMembers.length, workflows.length, addTeamMember, addWorkflow, addTask, updateWorkflow, initialized]); // Include all dependencies
}