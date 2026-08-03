// src/lib/constants.ts

import type {
  Application,
  ApplicationStatus,
  ApplicationSource,
  WorkMode,
} from '@/types';
import { APPLICATION_STATUSES } from '@/types';

export const FUNNEL_STAGES: readonly ApplicationStatus[] = [
  'discovered',
  'applied',
  'responded',
  'screening',
  'tech_interview',
  'final_round',
  'offer',
  'on_hold',
  'accepted',
];

/** Stages treated as closed / archive on the Kanban board. */
export const CLOSED_STAGES: readonly ApplicationStatus[] = [
  'accepted',
  'rejected',
  'ghosted',
  'withdrawn',
];

export const ACTIVE_APPLICATION_STAGES: readonly ApplicationStatus[] =
  FUNNEL_STAGES.filter(
    (stage) => stage !== 'discovered' && stage !== 'accepted',
  );

export const KANBAN_STAGES: readonly ApplicationStatus[] =
  APPLICATION_STATUSES.filter((stage) => stage !== 'withdrawn');

export const ACTIVE_KANBAN_STAGES: readonly ApplicationStatus[] =
  KANBAN_STAGES.filter((stage) => !CLOSED_STAGES.includes(stage));

// src/lib/constants.ts

// ... existing code ...

export const STAGE_LABELS: Record<ApplicationStatus, string> = {
  discovered: 'Discovered',
  applied: 'Applied',
  responded: 'Responded',
  screening: 'Screening',
  tech_interview: 'Technical',
  final_round: 'Final Round',
  offer: 'Offer',
  on_hold: 'On Hold',
  accepted: 'Accepted',
  rejected: 'Rejected',
  ghosted: 'Ghosted',
  withdrawn: 'Withdrawn',
};

export const STAGE_COLOURS: Record<ApplicationStatus, string> = {
  discovered: '#6366f1',
  applied: '#10b981',
  responded: '#0ea5e9',
  screening: '#f9842c',
  tech_interview: '#d946ef',
  final_round: '#ec4899',
  offer: '#14b8a6',
  on_hold: '#f59e0b',
  accepted: '#10b981',
  rejected: '#ef4444',
  ghosted: '#6b7280',
  withdrawn: '#9ca3af',
};

// ... rest stays the same ...

export const SOURCE_LABELS: Record<ApplicationSource, string> = {
  linkedin: 'LinkedIn',
  indeed: 'Indeed',
  recruiter_inbound: 'Recruiter (Inbound)',
  recruiter_outbound: 'Recruiter (Outbound)',
  referral: 'Referral',
  company_website: 'Company Website',
  job_board: 'Job Board',
  networking: 'Networking',
  cold_outreach: 'Cold Outreach',
  other: 'Other',
};

export const WORK_MODE_LABELS: Record<WorkMode, string> = {
  remote: 'Remote',
  hybrid: 'Hybrid',
  onsite: 'On-site',
};

/** Resolve work mode with a fallback for rows that only have the legacy remote flag. */
export function getApplicationWorkMode(
  app: Pick<Application, 'remote'> & { work_mode?: WorkMode | null },
): WorkMode {
  if (
    app.work_mode === 'remote' ||
    app.work_mode === 'hybrid' ||
    app.work_mode === 'onsite'
  ) {
    return app.work_mode;
  }
  return app.remote ? 'remote' : 'onsite';
}

export const HEALTHY_RATES = {
  applied_to_responded: {
    min: 10,
    max: 20,
    label: 'Response Rate',
  },
  responded_to_screening: {
    min: 50,
    max: 70,
    label: 'Screen Rate',
  },
  screening_to_tech: {
    min: 40,
    max: 60,
    label: 'Tech Pass Rate',
  },
  tech_to_final: {
    min: 50,
    max: 70,
    label: 'Final Rate',
  },
  final_to_offer: {
    min: 20,
    max: 40,
    label: 'Offer Rate',
  },
} as const;
