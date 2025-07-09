import { useEnhancedQAStore } from '@/store/enhancedStore';
import { useEffect, useState } from 'react';

/**
 * Hook para inicializar datos de usuarios en el enhancedStore
 * Solo se ejecuta en el cliente y cuando no hay usuarios existentes
 */
export function useEnhancedUserData() {
  const {
    users,
    addUser
  } = useEnhancedQAStore();

  // Estado para controlar si ya se han inicializado los datos
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Evitar inicialización en el servidor
    if (typeof window === 'undefined') return;

    // Solo inicializar datos si no hay usuarios existentes y no se han inicializado antes
    const shouldSeedData = !initialized && users.length === 0;

    if (shouldSeedData) {
      // Inicializar usuarios
      const initialUsers = [
        {
          name: 'Sebastian Cerpa',
          email: 'sebastian.cerpa@example.com',
          role: 'QA Lead',
          avatar: '/avatars/sebastian.jpg',
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

      // Agregar usuarios al store
      initialUsers.forEach((userData) => {
        addUser(userData as any);
      });

      // Marcar como inicializado para evitar múltiples inicializaciones
      setInitialized(true);
    }
  }, [users.length, addUser, initialized]);
}