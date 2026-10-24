/**
 * Hook to check if current user has admin access
 * Used by all /admin pages to enforce role-based access
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/env';

export type AdminRole = 'content_manager' | 'super_admin';

interface UseAdminAuthResult {
  loading: boolean;
  authorized: boolean;
  role: AdminRole | null;
  userId: string | null;
}

export function useAdminAuth(requiredRole?: AdminRole): UseAdminAuthResult {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [role, setRole] = useState<AdminRole | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      // If Supabase is not configured, allow access for development
      if (!isSupabaseConfigured()) {
        setAuthorized(true);
        setRole('super_admin');
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();

        // Check if user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          setAuthorized(false);
          setLoading(false);
          router.push('/');
          return;
        }

        setUserId(user.id);

        // Check user has admin role
        const { data: memberships, error: membershipError } = await supabase
          .from('user_membership')
          .select('role')
          .eq('user_id', user.id);

        if (membershipError) {
          console.error('Error checking memberships:', membershipError);
          setAuthorized(false);
          setLoading(false);
          router.push('/');
          return;
        }

        // Check if user has required role
        const adminMembership = memberships?.find((m: { role: string }) =>
          m.role === 'content_manager' || m.role === 'super_admin'
        ) as { role: string } | undefined;

        if (!adminMembership) {
          setAuthorized(false);
          setLoading(false);
          router.push('/');
          return;
        }

        const userRole = adminMembership.role as AdminRole;

        // If specific role is required, check for it
        if (requiredRole === 'super_admin' && userRole !== 'super_admin') {
          setAuthorized(false);
          setLoading(false);
          router.push('/admin');
          return;
        }

        setRole(userRole);
        setAuthorized(true);
        setLoading(false);
      } catch (err) {
        console.error('Auth check error:', err);
        setAuthorized(false);
        setLoading(false);
        router.push('/');
      }
    }

    checkAuth();
  }, [router, requiredRole]);

  return { loading, authorized, role, userId };
}
