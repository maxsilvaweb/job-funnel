// src/lib/hooks/use-applications.ts

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { Application, ApplicationStatus } from '@/types';

export function useApplications() {
  const supabase = createClient();

  return useQuery({
    queryKey: ['applications'],
    queryFn: async (): Promise<Application[]> => {
      const { data, error } = await supabase
        .from('applications')
        .select('*, stages(*)')
        .order('date_applied', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
}

export function useApplication(id: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['applications', id],
    queryFn: async (): Promise<Application> => {
      const { data, error } = await supabase
        .from('applications')
        .select('*, stages(*)')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useUpdateStatus() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: ApplicationStatus;
    }) => {
      const { error: updateError } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', id);

      if (updateError) throw updateError;

      const { error: stageError } = await supabase.from('stages').insert({
        application_id: id,
        stage_name: status,
        date_entered: new Date().toISOString().split('T')[0],
        outcome: 'pending',
      });

      if (stageError) throw stageError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}

export function useDeleteApplication() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}
