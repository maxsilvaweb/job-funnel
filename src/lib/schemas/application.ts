// src/lib/schemas/application.ts

import { z } from 'zod';

export const applicationSchema = z.object({
  company: z.string().min(1, 'Company name is required').max(200),
  role: z.string().min(1, 'Role is required').max(200),
  employment_type: z.enum(['permanent', 'contract']).default('permanent'),
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
      'discovered',
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
  // Permanent
  salary_min: z.number().nonnegative().nullable().optional(),
  salary_max: z.number().nonnegative().nullable().optional(),
  salary_currency: z.string().default('GBP'),
  // Contract
  day_rate_min: z.number().nonnegative().nullable().optional(),
  day_rate_max: z.number().nonnegative().nullable().optional(),
  ir35_status: z
    .enum(['inside', 'outside', 'undetermined'])
    .nullable()
    .optional(),
  location: z.string().nullable().optional(),
  remote: z.boolean().default(false),
  job_url: z.string().url().nullable().optional().or(z.literal('')),
  contact_name: z.string().nullable().optional(),
  contact_email: z.string().email().nullable().optional().or(z.literal('')),
  notes: z.string().nullable().optional(),
  priority: z.number().min(0).max(5).default(0),
}).superRefine((data, ctx) => {
  if (data.employment_type === 'permanent') {
    if (data.salary_min == null) {
      ctx.addIssue({
        code: 'custom',
        path: ['salary_min'],
        message: 'Salary minimum is required for permanent roles',
      });
    }

    if (data.salary_max == null) {
      ctx.addIssue({
        code: 'custom',
        path: ['salary_max'],
        message: 'Salary maximum is required for permanent roles',
      });
    }

    if (
      data.salary_min != null &&
      data.salary_max != null &&
      data.salary_max < data.salary_min
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['salary_max'],
        message: 'Salary maximum must be at least the salary minimum',
      });
    }
  }

  if (data.employment_type === 'contract') {
    if (data.day_rate_min == null) {
      ctx.addIssue({
        code: 'custom',
        path: ['day_rate_min'],
        message: 'Day rate minimum is required for contract roles',
      });
    }

    if (
      data.day_rate_min != null &&
      data.day_rate_max != null &&
      data.day_rate_max < data.day_rate_min
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['day_rate_max'],
        message: 'Day rate maximum must be at least the day rate minimum',
      });
    }
  }
});

export type ApplicationFormData = z.infer<typeof applicationSchema>;
