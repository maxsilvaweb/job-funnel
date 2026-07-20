// src/app/api/users/route.ts

import { NextResponse } from 'next/server';
import { createAdminClient, verifyN8nAuth } from '@/lib/supabase/admin';
import { sanitizePlainText } from '@/lib/utils/sanitize-text';

export async function GET(request: Request) {
  if (!verifyN8nAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase.from('user_preferences').select('*');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const users = (data || []).map((user) => ({
    ...user,
    resume_text: sanitizePlainText(user.resume_text),
  }));

  return NextResponse.json({ users });
}
