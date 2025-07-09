import { useEnhancedQAStore } from '@/store/enhancedStore';
import { useEffect, useState } from 'react';

/**
 * Hook para inicializar datos de prueba en el enhancedStore
 * Solo se ejecuta en el cliente y cuando el almacenamiento está vacío
 */
export function useEnhancedSeedData() {
  const {
    users,
    tickets,
    sprints,
    addTicket,
    addSprint
  } = useEnhancedQAStore();

  // Estado para controlar si ya se han inicializado los datos
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Evitar inicialización en el servidor
    if (typeof window === 'undefined') return;

    // Solo inicializar datos si no hay datos existentes y no se han inicializado antes
    const shouldSeedData = !initialized && users.length === 0;

    if (shouldSeedData) {

      // Paso 1: Agregar sprints
      const initialSprints = [
        {
          name: 'Sprint 1',
          description: 'Primer sprint del proyecto',
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-01-14'),
          status: 'Completed',
          goals: ['Completar funcionalidades básicas'],
          specifications: [],
          ticketIds: [],
          velocity: 0,
          burndownData: []
        },
        {
          name: 'Sprint 2',
          description: 'Segundo sprint del proyecto',
          startDate: new Date('2023-01-15'),
          endDate: new Date('2023-01-28'),
          status: 'Active',
          goals: ['Implementar características avanzadas'],
          specifications: [],
          ticketIds: [],
          velocity: 0,
          burndownData: []
        },
      ];

      const sprintIds: string[] = [];
      initialSprints.forEach((sprint) => {
        const newSprint = addSprint(sprint as any);
        sprintIds.push(newSprint.id);
      });

      // Paso 2: Agregar tickets sin asignar a usuarios específicos
      // Los tickets serán asignados a miembros del equipo desde la interfaz de usuario
      const initialTickets = [
        {
          title: 'Implementar login de usuarios',
          description: 'Crear formulario de login con validación',
          acceptanceCriteria: '- Validar email\n- Mostrar errores\n- Redireccionar al dashboard',
          status: 'In Progress',
          priority: 'High',
          tags: ['frontend', 'auth'],
          sprintId: sprintIds[0],
          reporterId: 'system', // ID genérico para el sistema
          linkedTestCases: [],
          estimatedHours: 8,
          actualHours: 6,
          attachments: []
        },
        {
          title: 'Corregir bug en formulario de registro',
          description: 'El formulario no valida correctamente el campo de teléfono',
          acceptanceCriteria: '- Validar formato de teléfono\n- Mostrar mensaje de error apropiado',
          status: 'Open',
          priority: 'Medium',
          tags: ['frontend', 'bug'],
          sprintId: sprintIds[1],
          reporterId: 'system', // ID genérico para el sistema
          linkedTestCases: [],
          estimatedHours: 4,
          actualHours: null,
          attachments: []
        },
        {
          title: 'Optimizar consultas a la base de datos',
          description: 'Las consultas actuales son ineficientes y causan lentitud',
          acceptanceCriteria: '- Reducir tiempo de respuesta en un 50%\n- Mantener la funcionalidad actual',
          status: 'Review',
          priority: 'Critical',
          tags: ['backend', 'performance'],
          sprintId: sprintIds[1],
          reporterId: 'system', // ID genérico para el sistema
          linkedTestCases: [],
          estimatedHours: 12,
          actualHours: 10,
          attachments: []
        },
      ];

      initialTickets.forEach((ticket) => {
        addTicket(ticket as any);
      });

      console.log('Datos de prueba inicializados correctamente para enhancedStore');

      // Marcar como inicializado para evitar múltiples inicializaciones
      setInitialized(true);
    }
  }, [users.length, tickets.length, sprints.length, addTicket, addSprint, initialized]);
}