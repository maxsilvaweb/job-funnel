// src/components/applications/stage-status-badge.tsx

import { STAGE_COLOURS, STAGE_LABELS } from '@/lib/constants';
import type { ApplicationStatus } from '@/types';

interface StageStatusBadgeProps {
  status: ApplicationStatus;
  children?: React.ReactNode;
}

/** Status pill — colours match kanban column dots via STAGE_COLOURS. */
export function StageStatusBadge({ status, children }: StageStatusBadgeProps) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
      style={{ backgroundColor: STAGE_COLOURS[status] }}
    >
      {children ?? STAGE_LABELS[status]}
    </span>
  );
}
