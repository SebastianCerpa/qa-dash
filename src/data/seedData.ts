import { useStore, TaskStatus, TaskPriority } from '@/store/useStore';
import { initialTeamMembers, initialWorkflows, initialTasks } from './initialData';
import { useEffect, useState } from 'react';

/**
 * Hook para inicializar datos de prueba en la aplicación
 * Solo se ejecuta en el cliente y cuando el almacenamiento está vacío
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

  // Estado para controlar si ya se han inicializado los datos
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Evitar inicialización en el servidor
    if (typeof window === 'undefined') return;

    // Solo inicializar datos si no hay datos existentes y no se han inicializado antes
    const shouldSeedData = !initialized && teamMembers.length === 0 && workflows.length === 0;

    if (shouldSeedData) {
      console.log('Inicializando datos de prueba...', { teamMembers, workflows });

      // Paso 1: Agregar miembros del equipo
      const teamMemberIds: string[] = [];
      initialTeamMembers.forEach((member) => {
        // Guardar el ID generado después de agregar el miembro
        addTeamMember(member);
        // Buscar el miembro recién agregado por su email para obtener su ID
        const newMember = teamMembers.find(m => m.email === member.email);
        if (newMember) {
          teamMemberIds.push(newMember.id);
        }
      });

      // Paso 2: Agregar flujos de trabajo con propietarios asignados
      const workflowIds: string[] = [];
      initialWorkflows.forEach((workflow, index) => {
        // Asignar propietario y colaboradores
        const ownerIndex = index % teamMemberIds.length;
        const collaboratorIndices = teamMemberIds
          .map((_, i) => i)
          .filter((i) => i !== ownerIndex)
          .slice(0, 2); // Asignar hasta 2 colaboradores

        const workflowWithOwner = {
          ...workflow,
          owner: teamMemberIds[ownerIndex],
          collaborators: collaboratorIndices.map((i) => teamMemberIds[i]),
        };

        // Agregar el flujo de trabajo
        addWorkflow(workflowWithOwner);
        // Buscar el flujo de trabajo recién agregado por su nombre para obtener su ID
        const newWorkflow = workflows.find(w => w.name === workflow.name);
        if (newWorkflow) {
          workflowIds.push(newWorkflow.id);
        }
      });

      // Paso 3: Agregar tareas y asignarlas a flujos de trabajo
      initialTasks.forEach((task, index) => {
        // Asignar a un flujo de trabajo
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

        // Agregar la tarea
        addTask(taskWithAssignments);
        
        // Buscar la tarea recién agregada por su título para obtener su ID
        // Usar setTimeout para asegurar que el estado se haya actualizado
        setTimeout(() => {
          const currentTasks = useStore.getState().tasks;
          const newTask = currentTasks.find(t => t.title === task.title);

          // Actualizar el flujo de trabajo para incluir la tarea
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

      // Marcar como inicializado para evitar múltiples inicializaciones
      setInitialized(true);
    }
  }, [teamMembers.length, workflows.length, addTeamMember, addWorkflow, addTask, updateWorkflow, initialized]); // Incluir todas las dependencias
}