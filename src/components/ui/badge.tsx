// src/components/ui/badge.tsx

import { clsx } from 'clsx';
import type { ApplicationStatus } from '@/types';

interface BadgeProps {
  status: ApplicationStatus;
  children: React.ReactNode;
}

const statusStyles: Record<ApplicationStatus, string> = {
  applied: 'bg-indigo-100 text-indigo-700',
  responded: 'bg-violet-100 text-violet-700',
  screening: 'bg-purple-100 text-purple-700',
  tech_interview: 'bg-fuchsia-100 text-fuchsia-700',
  final_round: 'bg-pink-100 text-pink-700',
  offer: 'bg-rose-100 text-rose-700',
  accepted: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  ghosted: 'bg-zinc-100 text-zinc-600',
  withdrawn: 'bg-zinc-100 text-zinc-500',
};

export function Badge({ status, children }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        statusStyles[status],
      )}
    >
      {children}
    </span>
  );
}
