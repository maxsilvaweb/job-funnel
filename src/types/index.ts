// src/types/index.ts

export type ApplicationStatus =
  | 'discovered'
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

// Rest stays the same...

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

export type StageOutcome =
  | 'passed'
  | 'failed'
  | 'pending'
  | 'skipped'
  | 'no_response';

export type EmploymentType = 'permanent' | 'contract';

export type IR35Status = 'inside' | 'outside' | 'undetermined';

export interface Application {
  id: string;
  user_id: string;
  company: string;
  role: string;
  source: ApplicationSource;
  status: ApplicationStatus;
  employment_type: EmploymentType;
  date_applied: string;
  // Permanent fields
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  // Contract fields
  day_rate: number | null;
  ir35_status: IR35Status | null;
  location: string | null;
  remote: boolean;
  job_url: string | null;
  contact_name: string | null;
  contact_email: string | null;
  notes: string | null;
  priority: number;
  created_at: string;
  updated_at: string;
  stages?: Stage[];
  tags?: Tag[];
}

export interface Stage {
  id: string;
  application_id: string;
  stage_name: ApplicationStatus;
  date_entered: string;
  date_completed: string | null;
  outcome: StageOutcome;
  notes: string | null;
  interviewer_names: string[] | null;
  feedback: string | null;
  created_at: string;
}

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  colour: string;
}

export interface WeeklyTarget {
  id: string;
  user_id: string;
  week_start: string;
  target_applications: number;
  target_responses: number;
  notes: string | null;
}

export interface FunnelMetrics {
  total_applications: number;
  responded: number;
  screening: number;
  tech_interview: number;
  final_round: number;
  offers: number;
  accepted: number;
  rejected: number;
  ghosted: number;
  response_rate: number;
  offer_rate: number;
}

export interface FunnelStage {
  name: string;
  count: number;
  conversionFromPrevious: number;
  conversionFromTop: number;
  colour: string;
}

export interface Diagnosis {
  stage: string;
  severity: 'good' | 'warning' | 'critical';
  message: string;
  suggestion: string;
}
