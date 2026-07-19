// src/components/layout/header.tsx

import { createClient } from '@/lib/supabase/server';
import { signOut } from '@/lib/actions/auth';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export async function Header() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-6">
      <div />
      <div className="flex items-center gap-4">
        {user && <span className="text-sm text-zinc-500">{user.email}</span>}
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
