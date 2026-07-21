// src/lib/constants.ts

import type { ApplicationStatus, ApplicationSource } from '@/types';

export const FUNNEL_STAGES: ApplicationStatus[] = [
  'discovered',
  'applied',
  'responded',
  'screening',
  'tech_interview',
  'final_round',
  'offer',
  'accepted',
];

/** Stages treated as closed / archive on the Kanban board. */
export const CLOSED_STAGES: ApplicationStatus[] = [
  'accepted',
  'rejected',
  'ghosted',
  'withdrawn',
];

// src/lib/constants.ts

// ... existing code ...

export const STAGE_LABELS: Record<ApplicationStatus, string> = {
  discovered: 'Discovered',
  applied: 'Applied',
  responded: 'Responded',
  screening: 'Screening',
  tech_interview: 'Technical Interview',
  final_round: 'Final Round',
  offer: 'Offer',
  accepted: 'Accepted',
  rejected: 'Rejected',
  ghosted: 'Ghosted',
  withdrawn: 'Withdrawn',
};

export const STAGE_COLOURS: Record<ApplicationStatus, string> = {
  discovered: '#ec4899',
  applied: '#10b981',
  responded: '#0ea5e9',
  screening: '#f59e0b',
  tech_interview: '#d946ef',
  final_round: '#ec4899',
  offer: '#14b8a6',
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
