// src/components/applications/application-form.tsx

'use client';

import { useForm } from '@tanstack/react-form';
import { createApplication, updateApplication } from '@/actions/applications';
import { SOURCE_LABELS } from '@/lib/constants';
import { Slider } from '@/components/ui/slider';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useToast } from '@/lib/hooks/use-toast';
import type { Application } from '@/types';
import type {
  ApplicationSource,
  ApplicationStatus,
  EmploymentType,
  IR35Status,
} from '@/types';

interface ApplicationFormProps {
  application?: Application;
  onSuccess?: () => void;
}

export function ApplicationForm({
  application,
  onSuccess,
}: ApplicationFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      company: application?.company ?? '',
      role: application?.role ?? '',
      employment_type: (application?.employment_type ??
        'permanent') as EmploymentType,
      source: (application?.source ?? 'linkedin') as ApplicationSource,
      status: (application?.status ?? 'applied') as ApplicationStatus,
      date_applied:
        application?.date_applied ?? new Date().toISOString().split('T')[0],
      // Permanent
      salary_min: application?.salary_min ?? null,
      salary_max: application?.salary_max ?? null,
      salary_currency: application?.salary_currency ?? 'GBP',
      // Contract
      day_rate_min: application?.day_rate_min ?? null,
      day_rate_max: application?.day_rate_max ?? null,
      ir35_status: (application?.ir35_status ?? 'undetermined') as IR35Status,
      location: application?.location ?? '',
      remote: application?.remote ?? false,
      job_url: application?.job_url ?? '',
      contact_name: application?.contact_name ?? '',
      contact_email: application?.contact_email ?? '',
      notes: application?.notes ?? '',
      priority: application?.priority ?? 0,
    },
    onSubmit: async ({ value }) => {
      setSubmitting(true);
      setError(null);

      try {
        const result = application
          ? await updateApplication(application.id, value)
          : await createApplication(value);

        if (result.error) {
          setError(result.error);
          toast({
            title: application
              ? 'Could not update application'
              : 'Could not add application',
            description: result.error,
            variant: 'error',
          });
          return;
        }

        queryClient.invalidateQueries({ queryKey: ['applications'] });
        toast({
          title: application ? 'Application updated' : 'Application added',
          description: application
            ? `${value.company} has been updated.`
            : `${value.company} has been added to your funnel.`,
          variant: 'success',
        });
        onSuccess?.();
      } catch {
        const message = 'Something went wrong. Please try again.';
        setError(message);
        toast({
          title: application
            ? 'Could not update application'
            : 'Could not add application',
          description: message,
          variant: 'error',
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-6"
    >
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Company and Role */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <form.Field name="company">
          {(field) => (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                Company *
              </label>
              <input
                type="text"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="e.g. BBC"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {field.state.meta.errors.length > 0 && (
                <p className="mt-1 text-xs text-red-500">
                  {field.state.meta.errors[0]}
                </p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="role">
          {(field) => (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                Role *
              </label>
              <input
                type="text"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="e.g. Senior Full Stack Engineer"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {field.state.meta.errors.length > 0 && (
                <p className="mt-1 text-xs text-red-500">
                  {field.state.meta.errors[0]}
                </p>
              )}
            </div>
          )}
        </form.Field>
      </div>

      {/* Employment Type Toggle */}
      <form.Field name="employment_type">
        {(field) => (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">
              Employment Type
            </label>
            <div className="flex rounded-lg border border-zinc-200 w-fit">
              <button
                type="button"
                onClick={() => field.handleChange('permanent')}
                className={`px-4 py-2 text-sm font-medium rounded-l-lg transition-colors ${
                  field.state.value === 'permanent'
                    ? 'bg-indigo-600 text-white'
                    : 'text-zinc-500 hover:text-zinc-700'
                }`}
              >
                Permanent
              </button>
              <button
                type="button"
                onClick={() => field.handleChange('contract')}
                className={`px-4 py-2 text-sm font-medium rounded-r-lg transition-colors ${
                  field.state.value === 'contract'
                    ? 'bg-indigo-600 text-white'
                    : 'text-zinc-500 hover:text-zinc-700'
                }`}
              >
                Contract
              </button>
            </div>
          </div>
        )}
      </form.Field>

      {/* Conditional salary / day rate fields */}
      <form.Subscribe selector={(state) => state.values.employment_type}>
        {(employmentType) =>
          employmentType === 'permanent' ? (
            /* Permanent — salary fields */
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <form.Field name="salary_min">
                {(field) => (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                      Salary Min *
                    </label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={field.state.value ?? ''}
                      onChange={(e) =>
                        field.handleChange(
                          e.target.value ? Number(e.target.value) : null,
                        )
                      }
                      placeholder="60000"
                      className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="salary_max">
                {(field) => (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                      Salary Max *
                    </label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={field.state.value ?? ''}
                      onChange={(e) =>
                        field.handleChange(
                          e.target.value ? Number(e.target.value) : null,
                        )
                      }
                      placeholder="85000"
                      className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="salary_currency">
                {(field) => (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                      Currency
                    </label>
                    <select
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="GBP">GBP £</option>
                      <option value="USD">USD $</option>
                      <option value="EUR">EUR €</option>
                    </select>
                  </div>
                )}
              </form.Field>
            </div>
          ) : (
            /* Contract — day rate range + IR35 fields */
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <form.Field name="day_rate_min">
                {(field) => (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                      Day Rate Min (£) *
                    </label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={field.state.value ?? ''}
                      onChange={(e) =>
                        field.handleChange(
                          e.target.value ? Number(e.target.value) : null,
                        )
                      }
                      placeholder="500"
                      className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="mt-1 text-xs text-red-500">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>

              <form.Field name="day_rate_max">
                {(field) => (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                      Day Rate Max (£)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={field.state.value ?? ''}
                      onChange={(e) =>
                        field.handleChange(
                          e.target.value ? Number(e.target.value) : null,
                        )
                      }
                      placeholder="650"
                      className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="mt-1 text-xs text-red-500">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>

              <form.Field name="ir35_status">
                {(field) => (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                      IR35 Status
                    </label>
                    <select
                      value={field.state.value ?? 'undetermined'}
                      onChange={(e) =>
                        field.handleChange(e.target.value as IR35Status)
                      }
                      className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="undetermined">Undetermined</option>
                      <option value="outside">Outside IR35</option>
                      <option value="inside">Inside IR35</option>
                    </select>
                  </div>
                )}
              </form.Field>
            </div>
          )
        }
      </form.Subscribe>

      {/* Source and Date */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <form.Field name="source">
          {(field) => (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                Source
              </label>
              <select
                value={field.state.value}
                onChange={(e) =>
                  field.handleChange(e.target.value as ApplicationSource)
                }
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {Object.entries(SOURCE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </form.Field>

        <form.Field name="date_applied">
          {(field) => (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                Date Applied *
              </label>
              <input
                type="date"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          )}
        </form.Field>
      </div>

      {/* Location and Remote */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <form.Field name="location">
          {(field) => (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                Location
              </label>
              <input
                type="text"
                value={field.state.value ?? ''}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="London"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          )}
        </form.Field>

        <form.Field name="remote">
          {(field) => (
            <div className="flex items-center gap-2 pt-7">
              <input
                type="checkbox"
                id="remote"
                checked={field.state.value}
                onChange={(e) => field.handleChange(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label
                htmlFor="remote"
                className="text-sm font-medium text-zinc-700"
              >
                Remote
              </label>
            </div>
          )}
        </form.Field>
      </div>

      {/* Job URL */}
      <form.Field name="job_url">
        {(field) => (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">
              Job URL
            </label>
            <input
              type="url"
              value={field.state.value ?? ''}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        )}
      </form.Field>

      {/* Contact */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <form.Field name="contact_name">
          {(field) => (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                Contact Name
              </label>
              <input
                type="text"
                value={field.state.value ?? ''}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Recruiter name"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          )}
        </form.Field>

        <form.Field name="contact_email">
          {(field) => (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                Contact Email
              </label>
              <input
                type="email"
                value={field.state.value ?? ''}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="recruiter@company.com"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          )}
        </form.Field>
      </div>

      {/* Notes */}
      <form.Field name="notes">
        {(field) => (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">
              Notes
            </label>
            <textarea
              value={field.state.value ?? ''}
              onChange={(e) => field.handleChange(e.target.value)}
              rows={3}
              placeholder="Any relevant notes..."
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        )}
      </form.Field>

      {/* Priority */}
      <form.Field name="priority">
        {(field) => (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">
              Priority (0–5)
            </label>
            <Slider
              value={field.state.value}
              onChange={(v) => field.handleChange(v)}
              min={0}
              max={5}
              formatValue={(v) => `Priority ${v} / 5`}
              minLabel="Low"
              maxLabel="High"
            />
          </div>
        )}
      </form.Field>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
        >
          {submitting
            ? 'Saving...'
            : application
              ? 'Update Application'
              : 'Add Application'}
        </button>
      </div>
    </form>
  );
}
