// src/app/api/resume/queue-normalize/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { N8N_WORKFLOWS, triggerN8n } from '@/lib/n8n/trigger';

/**
 * Authenticated user endpoint: loads their saved resume_text and
 * POSTs it to the n8n "Normalize Resume" webhook for markdown structuring.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: prefs, error } = await supabase
    .from('user_preferences')
    .select('resume_text')
    .eq('user_id', user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const resumeText = String(prefs?.resume_text || '').trim();
  if (!resumeText) {
    return NextResponse.json({ queued: false, reason: 'empty_resume' });
  }

  const result = await triggerN8n(N8N_WORKFLOWS.resumeNormalize, {
    user_id: user.id,
    resume_text: resumeText,
  });

  if (!result.ok) {
    if (result.reason === 'webhook_not_configured') {
      return NextResponse.json({
        queued: false,
        reason: 'webhook_not_configured',
      });
    }

    console.error(
      '[resume/queue-normalize] n8n webhook failed:',
      result.status,
      result.detail,
    );
    return NextResponse.json(
      { queued: false, reason: 'webhook_failed' },
      { status: 502 },
    );
  }

  return NextResponse.json({ queued: true });
}
