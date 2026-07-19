// src/lib/schemas/application.ts

import { z } from 'zod';

export const applicationSchema = z.object({
  company: z.string().min(1, 'Company name is required').max(200),
  role: z.string().min(1, 'Role is required').max(200),
  source: z.enum([
    'linkedin',
    'indeed',
    'recruiter_inbound',
    'recruiter_outbound',
    'referral',
    'company_website',
    'job_board',
    'networking',
    'cold_outreach',
    'other',
  ]),
  status: z
    .enum([
      'applied',
      'responded',
      'screening',
      'tech_interview',
      'final_round',
      'offer',
      'accepted',
      'rejected',
      'ghosted',
      'withdrawn',
    ])
    .default('applied'),
  date_applied: z.string().min(1, 'Date is required'),
  salary_min: z.number().nullable().optional(),
  salary_max: z.number().nullable().optional(),
  salary_currency: z.string().default('GBP'),
  location: z.string().nullable().optional(),
  remote: z.boolean().default(false),
  job_url: z.string().url().nullable().optional().or(z.literal('')),
  contact_name: z.string().nullable().optional(),
  contact_email: z.string().email().nullable().optional().or(z.literal('')),
  notes: z.string().nullable().optional(),
  priority: z.number().min(0).max(5).default(0),
});

export type ApplicationFormData = z.infer<typeof applicationSchema>;
