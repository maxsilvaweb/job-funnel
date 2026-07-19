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
