'use client';

import { useEffect, useState } from 'react';
import { useStore, TaskStatus, TaskPriority } from '@/store/useStore';
import { initialTeamMembers, initialWorkflows, initialTasks } from '@/data/initialData';

// Hook personalizado que maneja la inicialización de datos de forma segura
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
  
  // Verificar que estamos en el cliente
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Inicializar datos solo en el cliente
  useEffect(() => {
    if (!isClient || initialized || typeof window === 'undefined') return;
    
    const shouldSeedData = teamMembers.length === 0 && workflows.length === 0;
    
    if (shouldSeedData) {
      console.log('Inicializando datos de prueba...');
      
      // Paso 1: Agregar miembros del equipo
      const teamMemberIds: string[] = [];
      initialTeamMembers.forEach((member) => {
        addTeamMember(member);
        const newMember = teamMembers.find(m => m.email === member.email);
        if (newMember) {
          teamMemberIds.push(newMember.id);
        }
      });
      
      // Paso 2: Agregar flujos de trabajo
      const workflowIds: string[] = [];
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
        const newWorkflow = workflows.find(w => w.name === workflow.name);
        if (newWorkflow) {
          workflowIds.push(newWorkflow.id);
        }
      });
      
      // Paso 3: Agregar tareas
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
        
        setTimeout(() => {
          const currentTasks = useStore.getState().tasks;
          const newTask = currentTasks.find(t => t.title === task.title);
          
          if (newTask) {
            const currentWorkflows = useStore.getState().workflows;
            const workflow = currentWorkflows.find((w) => w.id === workflowIds[workflowIndex]);
            if (workflow) {
              updateWorkflow(workflow.id, {
                ...workflow,
                tasks: [...workflow.tasks, newTask.id],
              });
            }
          }
        }, 0);
      });
      
      setInitialized(true);
    }
  }, [isClient, initialized, teamMembers.length, workflows.length, addTeamMember, addWorkflow, addTask, updateWorkflow]);
}

// Componente separado para inicializar datos
function DataInitializer() {
  useClientSideDataInitialization();
  return null;
}

export default function DataProvider({ children }: { children: React.ReactNode }) {
  // Estado para controlar si estamos en el cliente
  const [isClient, setIsClient] = useState(false);
  
  // Verificar si estamos en el cliente
  useEffect(() => {
    // Usar un pequeño delay para asegurar que la hidratación esté completa
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