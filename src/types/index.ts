// src/types/index.ts

export type ApplicationStatus =
  | 'applied'
  | 'responded'
  | 'screening'
  | 'tech_interview'
  | 'final_round'
  | 'offer'
  | 'accepted'
  | 'rejected'
  | 'ghosted'
  | 'withdrawn';

export type ApplicationSource =
  | 'linkedin'
  | 'indeed'
  | 'recruiter_inbound'
  | 'recruiter_outbound'
  | 'referral'
  | 'company_website'
  | 'job_board'
  | 'networking'
  | 'cold_outreach'
  | 'other';

export type StageOutcome = 'passed' | 'failed' | 'pending' | 'no_response';

export interface Stage {
  id: string;
  application_id: string;
  stage_name: ApplicationStatus;
  date_entered: string;
  outcome: StageOutcome;
  notes: string | null;
  feedback: string | null;
}

export interface Application {
  id: string;
  user_id: string;
  company: string;
  role: string;
  source: ApplicationSource;
  status: ApplicationStatus;
  date_applied: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  location: string | null;
  remote: boolean;
  job_url: string | null;
  contact_name: string | null;
  contact_email: string | null;
  notes: string | null;
  priority: number;
  stages: Stage[];
  created_at: string;
  updated_at: string;
}

export interface FunnelStage {
  name: string;
  count: number;
  conversionFromPrevious: number;
  conversionFromTop: number;
  colour: string;
}

export type DiagnosisSeverity = 'good' | 'warning' | 'critical';

export interface Diagnosis {
  stage: string;
  severity: DiagnosisSeverity;
  message: string;
  suggestion: string;
}
