// src/components/auth-cache-guard.tsx

'use client';

import { useEffect, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

/**
 * Clears all React Query cache when the auth user changes so
 * one account never sees another account's cached data.
 */
export function AuthCacheGuard({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        queryClient.clear();
      }
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  return children;
}
