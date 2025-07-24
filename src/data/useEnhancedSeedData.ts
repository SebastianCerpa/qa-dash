import { useEnhancedQAStore } from '@/store/enhancedStore';
import { useEffect, useState } from 'react';

/**
 * Hook to initialize test data in the enhancedStore
 * Only runs on the client and when storage is empty
 */
export function useEnhancedSeedData() {
  const {
    users,
    tickets,
    sprints,
    addTicket,
    addSprint
  } = useEnhancedQAStore();

  // State to control if data has already been initialized
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Avoid initialization on server
    if (typeof window === 'undefined') return;

    // Only initialize data if no existing data and not initialized before
    const shouldSeedData = !initialized && users.length === 0;

    if (shouldSeedData) {

      // Step 1: Add sprints
      const initialSprints = [
        {
          name: 'Sprint 1',
          description: 'First project sprint',
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-01-14'),
          status: 'Completed',
          goals: ['Complete basic functionalities'],
          specifications: [],
          ticketIds: [],
          velocity: 0,
          burndownData: []
        },
        {
          name: 'Sprint 2',
          description: 'Second project sprint',
          startDate: new Date('2023-01-15'),
          endDate: new Date('2023-01-28'),
          status: 'Active',
          goals: ['Implement advanced features'],
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

      // Step 2: Add tickets without assigning to specific users
// Tickets will be assigned to team members from the user interface
      const initialTickets = [
        {
          title: 'Implement user login',
          description: 'Create login form with validation',
          acceptanceCriteria: '- Validate email\n- Show errors\n- Redirect to dashboard',
          status: 'In Progress',
          priority: 'High',
          tags: ['frontend', 'auth'],
          sprintId: sprintIds[0],
          reporterId: 'system', // Generic ID for the system
          linkedTestCases: [],
          estimatedHours: 8,
          actualHours: 6,
          attachments: []
        },
        {
          title: 'Fix bug in registration form',
          description: 'The form does not correctly validate the phone field',
          acceptanceCriteria: '- Validate phone format\n- Show appropriate error message',
          status: 'Open',
          priority: 'Medium',
          tags: ['frontend', 'bug'],
          sprintId: sprintIds[1],
          reporterId: 'system', // Generic ID for the system
          linkedTestCases: [],
          estimatedHours: 4,
          actualHours: null,
          attachments: []
        },
        {
          title: 'Optimize database queries',
          description: 'Current queries are inefficient and cause slowness',
          acceptanceCriteria: '- Reduce response time by 50%\n- Maintain current functionality',
          status: 'Review',
          priority: 'Critical',
          tags: ['backend', 'performance'],
          sprintId: sprintIds[1],
          reporterId: 'system', // Generic ID for the system
          linkedTestCases: [],
          estimatedHours: 12,
          actualHours: 10,
          attachments: []
        },
      ];

      initialTickets.forEach((ticket) => {
        addTicket(ticket as any);
      });

      console.log('Test data initialized correctly for enhancedStore');

      // Mark as initialized to avoid multiple initializations
      setInitialized(true);
    }
  }, [users.length, tickets.length, sprints.length, addTicket, addSprint, initialized]);
}
