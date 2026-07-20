// src/components/layout/header.tsx

import { createClient } from '@/lib/supabase/server';
import { signOut } from '@/lib/actions/auth';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { User } from 'lucide-react';

export async function Header() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-6">
      <div />
      <div className="flex items-center gap-4">
        {user && (
          <span className="inline-flex items-center gap-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
            <User className="h-4 w-4" />
            {user.email}
          </span>
        )}
        <ThemeToggle />
        <form action={signOut}>
          <button
            type="submit"
            className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
