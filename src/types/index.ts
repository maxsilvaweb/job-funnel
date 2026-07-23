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

export type IR35Preference = 'inside' | 'outside' | 'both';

export type WorkMode = 'remote' | 'hybrid' | 'onsite';

export interface Application {
  id: string;
  user_id: string;
  company: string;
  role: string;
  source: ApplicationSource;
  status: ApplicationStatus;
  employment_type: EmploymentType;
  date_applied: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  day_rate_min: number | null;
  day_rate_max: number | null;
  ir35_status: IR35Status | null;
  location: string | null;
  work_mode: WorkMode;
  /** Derived from work_mode === 'remote'; kept for legacy filters/imports. */
  remote: boolean;
  job_url: string | null;
  contact_name: string | null;
  contact_email: string | null;
  notes: string | null;
  priority: number;
  ai_score: number | null;
  ai_reasoning: string | null;
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
  /** Progression stages shrink down the funnel; outcomes are absolute terminal counts. */
  kind?: 'progression' | 'outcome';
}

export interface WeeklyTrendPoint {
  week: string;
  weekStart: string;
  applications: number;
  cumulative: number;
}

export interface Diagnosis {
  stage: string;
  severity: 'good' | 'warning' | 'critical';
  message: string;
  suggestion: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  target_roles: string[];
  target_keywords: string[];
  employment_types: string[];
  min_ai_score: number;
  ir35_preference: IR35Preference;
  notify_email: boolean;
  notify_email_address: string | null;
  automation_enabled: boolean;
  resume_text: string;
  preferred_work_modes: string[];
  preferred_locations: string[];
  created_at: string;
  updated_at: string;
}
