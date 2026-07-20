// src/components/ui/badge.tsx

import { StageStatusBadge } from '@/components/applications/stage-status-badge';
import type { ApplicationStatus } from '@/types';

interface BadgeProps {
  status: ApplicationStatus;
  children: React.ReactNode;
}

export function Badge({ status, children }: BadgeProps) {
  return <StageStatusBadge status={status}>{children}</StageStatusBadge>;
}
