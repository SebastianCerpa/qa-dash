import { useEnhancedQAStore } from '@/store/enhancedStore';
import { useEffect, useState } from 'react';

/**
 * Hook to initialize user data in the enhancedStore
 * Only runs on the client and when no existing users
 */
export function useEnhancedUserData() {
  const {
    users,
    addUser
  } = useEnhancedQAStore();

  // State to control if data has already been initialized
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Avoid initialization on server
    if (typeof window === 'undefined') return;

    // Only initialize data if no existing users and not initialized before
    const shouldSeedData = !initialized && users.length === 0;

    if (shouldSeedData) {
      // Initialize users
      const initialUsers = [
        {
          name: 'John Doe',
          email: 'john.doe@example.com',
          role: 'QA Lead',
          avatar: '/avatars/default.jpg',
          permissions: [
            { resource: 'tickets', actions: ['create', 'read', 'update', 'delete'] },
            { resource: 'users', actions: ['create', 'read', 'update', 'delete'] },
            { resource: 'reports', actions: ['create', 'read'] }
          ],
          isActive: true,
          preferences: {
            theme: 'light',
            timezone: 'America/Santiago'
          }
        },
      ];

      // Add users to store
      initialUsers.forEach((userData) => {
        addUser(userData as any);
      });

      // Mark as initialized to avoid multiple initializations
      setInitialized(true);
    }
  }, [users.length, addUser, initialized]);
}
