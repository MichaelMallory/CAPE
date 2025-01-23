import { useEffect, useState, useRef } from 'react';
import type { User } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';
import { supabase } from '@/lib/supabase/client';

type UserRole = 'HERO' | 'SUPPORT' | 'ADMIN' | null;

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    let subscription: { unsubscribe: () => void } | null = null;

    async function initializeAuth() {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('🔐 Auth Hook - Initial Session:', {
          hasSession: !!session,
          userId: session?.user?.id,
          error: error?.message
        });

        if (session?.user) {
          setUser(session.user);
          // Get role from metadata
          const userRole = session.user.user_metadata.role as UserRole;
          console.log('👤 Auth Hook - User Role:', { userRole });
          setRole(userRole);
        }

        // Set up auth state change listener
        const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('🔄 Auth Hook - Auth State Change:', {
              event,
              hasSession: !!session,
              userId: session?.user?.id
            });

            if (session?.user) {
              setUser(session.user);
              const userRole = session.user.user_metadata.role as UserRole;
              console.log('👤 Auth Hook - Updated Role:', { userRole });
              setRole(userRole);
            } else {
              setUser(null);
              setRole(null);
            }
          }
        );

        subscription = sub;
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    }

    initializeAuth();

    return () => {
      if (subscription) {
        console.log('🔒 Auth Hook - Cleanup');
        subscription.unsubscribe();
      }
    };
  }, []); // Empty dependency array since we're using useRef for initialization check

  return {
    user,
    role,
    loading,
    isAuthenticated: !!user,
  };
} 