// src/app/api/ingest/route.ts

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient, verifyN8nAuth } from '@/lib/supabase/admin';

const ingestSchema = z.object({
  user_id: z.string().uuid(),
  company: z.string().min(1).max(200),
  role: z.string().min(1).max(200),
  job_url: z.string().url().or(z.literal('')).optional().nullable(),
  location: z.string().nullable().optional(),
  remote: z.boolean().optional().default(false),
  employment_type: z.enum(['permanent', 'contract']).optional().default('permanent'),
  ai_score: z.number().min(0).max(100).nullable().optional(),
  ai_reasoning: z.string().nullable().optional(),
});

export async function POST(request: Request) {
  if (!verifyN8nAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = ingestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const payload = parsed.data;
  const jobUrl = payload.job_url?.trim() || null;
  const today = new Date().toISOString().split('T')[0];
  const supabase = createAdminClient();

  // Skip duplicates for the same user + job URL
  if (jobUrl) {
    const { data: existing } = await supabase
      .from('applications')
      .select('id')
      .eq('user_id', payload.user_id)
      .eq('job_url', jobUrl)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        skipped: true,
        reason: 'duplicate',
        id: existing.id,
      });
    }
  }

  const { data, error } = await supabase
    .from('applications')
    .insert({
      user_id: payload.user_id,
      company: payload.company.trim(),
      role: payload.role.trim(),
      source: 'job_board',
      status: 'discovered',
      employment_type: payload.employment_type,
      date_applied: today,
      location: payload.location?.trim() || null,
      remote: payload.remote ?? false,
      job_url: jobUrl,
      notes: null,
      priority: payload.ai_score && payload.ai_score >= 90 ? 4 : 3,
      ai_score: payload.ai_score ?? null,
      ai_reasoning: payload.ai_reasoning?.trim() || null,
      salary_currency: 'GBP',
    })
    .select()
    .single();

  if (error) {
    console.error('ingest error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from('stages').insert({
    application_id: data.id,
    stage_name: 'discovered',
    date_entered: today,
    outcome: 'pending',
  });

  return NextResponse.json({ success: true, id: data.id }, { status: 201 });
}
