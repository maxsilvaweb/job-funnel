// src/components/applications/application-form.tsx

'use client';

import { useForm } from '@tanstack/react-form';
import { createApplication, updateApplication } from '@/actions/applications';
import { SOURCE_LABELS, WORK_MODE_LABELS, getApplicationWorkMode } from '@/lib/constants';
import { Slider } from '@/components/ui/slider';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { CheckCircle2, LogOut, Save } from 'lucide-react';
import { useToast } from '@/lib/hooks/use-toast';
import type { Application } from '@/types';
import type {
  ApplicationSource,
  ApplicationStatus,
  EmploymentType,
  IR35Status,
  WorkMode,
} from '@/types';

interface ApplicationFormProps {
  application?: Application;
  /** Called when the user is finished (edit save, or create + Done). */
  onSuccess?: () => void;
}

type StickyCreateDefaults = {
  employment_type: EmploymentType;
  source: ApplicationSource;
  status: ApplicationStatus;
  date_applied: string;
  salary_currency: string;
  work_mode: WorkMode;
};

function emptyCreateValues(sticky?: Partial<StickyCreateDefaults>) {
  return {
    company: '',
    role: '',
    employment_type: (sticky?.employment_type ?? 'permanent') as EmploymentType,
    source: (sticky?.source ?? 'linkedin') as ApplicationSource,
    status: (sticky?.status ?? 'applied') as ApplicationStatus,
    date_applied:
      sticky?.date_applied ?? new Date().toISOString().split('T')[0],
    salary_min: null as number | null,
    salary_max: null as number | null,
    salary_currency: sticky?.salary_currency ?? 'GBP',
    day_rate_min: null as number | null,
    day_rate_max: null as number | null,
    ir35_status: 'undetermined' as IR35Status,
    location: '',
    work_mode: (sticky?.work_mode ?? 'onsite') as WorkMode,
    job_url: '',
    contact_name: '',
    contact_email: '',
    notes: '',
    priority: 0,
  };
}

export function ApplicationForm({
  application,
  onSuccess,
}: ApplicationFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justCreatedCompany, setJustCreatedCompany] = useState<string | null>(
    null,
  );
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
      work_mode: application
        ? getApplicationWorkMode(application)
        : ('onsite' as WorkMode),
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

        if (application) {
          onSuccess?.();
          return;
        }

        // Create: reset for another entry, keep useful defaults
        form.reset(
          emptyCreateValues({
            employment_type: value.employment_type,
            source: value.source,
            status: value.status,
            date_applied: value.date_applied,
            salary_currency: value.salary_currency,
            work_mode: value.work_mode,
          }),
        );
        setJustCreatedCompany(value.company);
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

  function handleDone() {
    setJustCreatedCompany(null);
    onSuccess?.();
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-6"
    >
      {justCreatedCompany && !application && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-zinc-900">
                {justCreatedCompany} added
              </p>
              <p className="mt-0.5 text-sm text-zinc-700">
                Form cleared for another entry. Add another or you&apos;re done.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDone}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              Done
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

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

      {/* Location and work mode */}
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

        <form.Field name="work_mode">
          {(field) => (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                Work mode
              </label>
              <select
                value={field.state.value}
                onChange={(e) =>
                  field.handleChange(e.target.value as WorkMode)
                }
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {(Object.keys(WORK_MODE_LABELS) as WorkMode[]).map((mode) => (
                  <option key={mode} value={mode}>
                    {WORK_MODE_LABELS[mode]}
                  </option>
                ))}
              </select>
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
      <div className="flex justify-end gap-2">
        {justCreatedCompany && !application && (
          <button
            type="button"
            onClick={handleDone}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            Done
            <LogOut className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
        >
          <Save className="h-3.5 w-3.5" />
          {submitting
            ? 'Saving...'
            : application
              ? 'Update Application'
              : justCreatedCompany
                ? 'Save'
                : 'Add Application'}
        </button>
      </div>
    </form>
  );
}
