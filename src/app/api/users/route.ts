// src/app/api/users/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { sanitizePlainText } from '@/lib/utils/sanitize-text';

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

export async function GET(request: Request) {
  // Verify this is n8n calling
  const token = request.headers.get('authorization');
  const expected = `Bearer ${process.env.N8N_WEBHOOK_SECRET}`;

  if (token !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Fetch all users and their preferences
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
