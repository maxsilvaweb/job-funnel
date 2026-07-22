// src/app/api/resume/normalized/route.ts

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient, verifyN8nAuth } from '@/lib/supabase/admin';
import { sanitizePlainText } from '@/lib/utils/sanitize-text';

const bodySchema = z.object({
  user_id: z.string().uuid(),
  resume_text: z.string().min(1),
});

/**
 * n8n callback: write normalized markdown CV back to user_preferences.
 */
export async function POST(request: Request) {
  if (!verifyN8nAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid body', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const resumeText = sanitizePlainText(parsed.data.resume_text);
  if (!resumeText) {
    return NextResponse.json(
      { error: 'resume_text is empty after sanitization' },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('user_preferences')
    .update({
      resume_text: resumeText,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', parsed.data.user_id)
    .select('user_id')
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json(
      { error: 'No preferences row found for user_id' },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    user_id: data.user_id,
    characters: resumeText.length,
  });
}
