// src/lib/hooks/use-applications.ts

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/lib/hooks/use-user';
import type { Application, ApplicationStatus } from '@/types';

export function useApplications() {
  const supabase = createClient();
  const { userId } = useUser();

  return useQuery({
    queryKey: ['applications', userId],
    queryFn: async (): Promise<Application[]> => {
      const { data, error } = await supabase
        .from('applications')
        .select('*, stages(*)')
        .order('date_applied', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
    staleTime: 0,
  });
}

export function useApplication(id: string) {
  const supabase = createClient();
  const { userId } = useUser();

  return useQuery({
    queryKey: ['applications', userId, id],
    queryFn: async (): Promise<Application> => {
      const { data, error } = await supabase
        .from('applications')
        .select('*, stages(*)')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id && !!userId,
    staleTime: 0,
  });
}

export function useUpdateStatus() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      onHoldComment,
      onHoldAt,
      rejectedComment,
    }: {
      id: string;
      status: ApplicationStatus;
      onHoldComment?: string;
      onHoldAt?: string;
      rejectedComment?: string;
    }) => {
      const updateData: Partial<Application> = { status };
      if (status === 'on_hold') {
        updateData.on_hold_comment = onHoldComment || null;
        updateData.on_hold_at = onHoldAt || null;
      } else if (status === 'rejected') {
        updateData.rejected_comment = rejectedComment || null;
      }

      const { error: updateError } = await supabase
        .from('applications')
        .update(updateData)
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
