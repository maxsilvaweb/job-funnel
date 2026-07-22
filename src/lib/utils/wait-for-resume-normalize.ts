// src/lib/utils/wait-for-resume-normalize.ts

import { createClient } from '@/lib/supabase/client';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Poll user_preferences.resume_text until it differs from `previousText`
 * (n8n overwrites raw extract with structured markdown).
 */
export async function waitForResumeNormalize(
  previousText: string,
  options?: { timeoutMs?: number; intervalMs?: number },
): Promise<string> {
  const timeoutMs = options?.timeoutMs ?? 90_000;
  const intervalMs = options?.intervalMs ?? 1_500;
  const previous = previousText.trim();
  const supabase = createClient();
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    await sleep(intervalMs);

    const { data, error } = await supabase
      .from('user_preferences')
      .select('resume_text')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    const next = String(data?.resume_text || '').trim();
    if (next && next !== previous) {
      return next;
    }
  }

  throw new Error(
    'Timed out waiting for CV structuring. Check the n8n workflow execution.',
  );
}
