// src/actions/applications.ts

'use server';

import { createClient } from '@/lib/supabase/server';
import { applicationSchema } from '@/lib/schemas/application';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { ApplicationFormData } from '@/lib/schemas/application';

// ─────────────────────────────────────────
// READ
// ─────────────────────────────────────────

export async function getApplications() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const { data, error } = await supabase
    .from('applications')
    .select('*, stages(*)')
    .eq('user_id', user.id)
    .order('date_applied', { ascending: false });

  if (error) {
    console.error('getApplications error:', error);
    return { data: [], error: error.message };
  }

  return { data: data || [], error: null };
}

export async function getApplication(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const { data, error } = await supabase
    .from('applications')
    .select('*, stages(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('getApplication error:', error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function getFunnelMetrics() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const { data, error } = await supabase
    .from('funnel_metrics')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('getFunnelMetrics error:', error);
    return null;
  }

  return data;
}

// ─────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────

export async function createApplication(formData: ApplicationFormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const validated = applicationSchema.parse(formData);

  const { data, error } = await supabase
    .from('applications')
    .insert({
      ...validated,
      user_id: user.id,
      job_url: validated.job_url || null,
      contact_email: validated.contact_email || null,
    })
    .select()
    .single();

  if (error) {
    console.error('createApplication error:', error);
    return { data: null, error: error.message };
  }

  // Auto-create the initial applied stage
  await supabase.from('stages').insert({
    application_id: data.id,
    stage_name: 'applied',
    date_entered: validated.date_applied,
    outcome: 'passed',
  });

  revalidatePath('/dashboard');
  revalidatePath('/applications');

  return { data, error: null };
}

// ─────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────

export async function updateApplication(
  id: string,
  formData: Partial<ApplicationFormData>,
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const { data, error } = await supabase
    .from('applications')
    .update(formData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('updateApplication error:', error);
    return { data: null, error: error.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/applications');
  revalidatePath(`/applications/${id}`);

  return { data, error: null };
}

export async function updateApplicationStatus(id: string, newStatus: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  // Update the application status
  const { error: updateError } = await supabase
    .from('applications')
    .update({ status: newStatus })
    .eq('id', id)
    .eq('user_id', user.id);

  if (updateError) {
    console.error('updateApplicationStatus error:', updateError);
    return { error: updateError.message };
  }

  // Add a new stage entry to track the progression
  const { error: stageError } = await supabase.from('stages').insert({
    application_id: id,
    stage_name: newStatus,
    date_entered: new Date().toISOString().split('T')[0],
    outcome: 'pending',
  });

  if (stageError) {
    console.error('updateApplicationStatus stage error:', stageError);
    return { error: stageError.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/applications');
  revalidatePath(`/applications/${id}`);

  return { error: null };
}

// ─────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────

export async function deleteApplication(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const { error } = await supabase
    .from('applications')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('deleteApplication error:', error);
    return { error: error.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/applications');

  return { error: null };
}
