// src/lib/supabase/admin.ts

import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
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

export function verifyN8nAuth(request: Request): boolean {
  const token = request.headers.get('authorization');
  const expected = `Bearer ${process.env.N8N_WEBHOOK_SECRET}`;
  return token === expected;
}
