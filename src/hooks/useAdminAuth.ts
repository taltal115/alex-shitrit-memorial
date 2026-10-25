/**
 * Hook to check if the current Firebase user has admin access.
 */

'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { resolveAdminRole } from '@/lib/firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase/client';
import { isFirebaseConfigured } from '@/lib/firebase/config';
import type { AdminRole } from '@/config/admins';

interface UseAdminAuthResult {
  loading: boolean;
  authorized: boolean;
  role: AdminRole | null;
  userId: string | null;
  configured: boolean;
}

export function useAdminAuth(requiredRole?: AdminRole): UseAdminAuthResult {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [role, setRole] = useState<AdminRole | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const configured = isFirebaseConfigured();

  useEffect(() => {
    if (!configured) {
      setAuthorized(true);
      setRole('super_admin');
      setUserId(null);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (user) => {
      if (!user) {
        setAuthorized(false);
        setRole(null);
        setUserId(null);
        setLoading(false);
        return;
      }

      try {
        const userRole = await resolveAdminRole(user);
        setUserId(user.uid);

        if (!userRole || (requiredRole === 'super_admin' && userRole !== 'super_admin')) {
          setRole(userRole);
          setAuthorized(false);
          setLoading(false);
          return;
        }

        setRole(userRole);
        setAuthorized(true);
        setLoading(false);
      } catch (err) {
        console.error('Auth check error:', err);
        setAuthorized(false);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [configured, requiredRole]);

  return { loading, authorized, role, userId, configured };
}
