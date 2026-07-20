// src/lib/hooks/use-preferences.ts

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { UserPreferences } from '@/types';

export function usePreferences() {
  const supabase = createClient();

  return useQuery({
    queryKey: ['preferences'],
    queryFn: async (): Promise<UserPreferences | null> => {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .single();

      if (error) return null;
      return data;
    },
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (updates: Partial<UserPreferences>) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_preferences')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['preferences'],
      });
    },
  });
}
