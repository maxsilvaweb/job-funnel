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
  employment_type: z
    .enum(['permanent', 'contract'])
    .optional()
    .default('permanent'),
  salary_min: z.number().nonnegative().nullable().optional(),
  salary_max: z.number().nonnegative().nullable().optional(),
  salary_currency: z
    .enum(['GBP', 'USD', 'EUR', 'AUD'])
    .optional()
    .default('GBP'),
  day_rate_min: z.number().nonnegative().nullable().optional(),
  day_rate_max: z.number().nonnegative().nullable().optional(),
  contact_email: z.string().email().nullable().optional().or(z.literal('')),
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
  const contactEmail = payload.contact_email?.trim() || null;
  const salaryMin = payload.salary_min ?? null;
  const salaryMax = payload.salary_max ?? null;
  const dayRateMin = payload.day_rate_min ?? null;
  const dayRateMax = payload.day_rate_max ?? null;
  const salaryCurrency = payload.salary_currency ?? 'GBP';
  const employmentType = payload.employment_type ?? 'permanent';

  // Skip duplicates for the same user + job URL
  if (jobUrl) {
    const { data: existing } = await supabase
      .from('applications')
      .select(
        'id, salary_min, salary_max, day_rate_min, day_rate_max, contact_email',
      )
      .eq('user_id', payload.user_id)
      .eq('job_url', jobUrl)
      .maybeSingle();

    if (existing) {
      // Backfill salary / contact if a re-run finds them and the row is empty
      const patch: Record<string, unknown> = {};
      if (existing.salary_min == null && salaryMin != null) {
        patch.salary_min = salaryMin;
        patch.salary_max = salaryMax;
        patch.salary_currency = salaryCurrency;
      }
      if (existing.day_rate_min == null && dayRateMin != null) {
        patch.day_rate_min = dayRateMin;
        patch.day_rate_max = dayRateMax;
        patch.employment_type = 'contract';
      }
      if (!existing.contact_email && contactEmail) {
        patch.contact_email = contactEmail;
      }

      if (Object.keys(patch).length > 0) {
        const { error: updateError } = await supabase
          .from('applications')
          .update(patch)
          .eq('id', existing.id);

        if (updateError) {
          console.error('ingest enrichment error:', updateError);
          return NextResponse.json(
            { error: updateError.message },
            { status: 500 },
          );
        }
      }

      return NextResponse.json({
        skipped: true,
        reason: 'duplicate',
        id: existing.id,
        enriched: Object.keys(patch).length > 0,
        salary_min: patch.salary_min ?? existing.salary_min,
        salary_max: patch.salary_max ?? existing.salary_max,
        contact_email: patch.contact_email ?? existing.contact_email,
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
      employment_type: employmentType,
      date_applied: today,
      location: payload.location?.trim() || null,
      remote: payload.remote ?? false,
      job_url: jobUrl,
      notes: null,
      priority: payload.ai_score && payload.ai_score >= 90 ? 4 : 3,
      ai_score: payload.ai_score ?? null,
      ai_reasoning: payload.ai_reasoning?.trim() || null,
      salary_min: salaryMin,
      salary_max: salaryMax,
      salary_currency: salaryCurrency,
      day_rate_min: dayRateMin,
      day_rate_max: dayRateMax,
      contact_email: contactEmail,
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

  return NextResponse.json(
    {
      success: true,
      id: data.id,
      salary_min: data.salary_min,
      salary_max: data.salary_max,
      salary_currency: data.salary_currency,
      day_rate_min: data.day_rate_min,
      day_rate_max: data.day_rate_max,
      contact_email: data.contact_email,
    },
    { status: 201 },
  );
}
