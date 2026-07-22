// src/components/layout/sign-out-button.tsx

'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function SignOutButton() {
  const queryClient = useQueryClient();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    queryClient.clear();
    router.push('/auth/login');
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="cursor-pointer text-sm text-zinc-500 transition-colors hover:text-zinc-900"
    >
      Sign out
    </button>
  );
}
