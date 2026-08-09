// src/components/applications/application-form.tsx

'use client';

import { useForm } from '@tanstack/react-form';
import { createApplication, updateApplication } from '@/actions/applications';
import {
  SOURCE_LABELS,
  STAGE_LABELS,
  WORK_MODE_LABELS,
  getApplicationWorkMode,
} from '@/lib/constants';
import { APPLICATION_STATUSES } from '@/types';
import { Slider } from '@/components/ui/slider';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Calendar, CheckCircle2, LogOut, RotateCcw, Save } from 'lucide-react';
import { useToast } from '@/lib/hooks/use-toast';
import { DateTimeInput } from '@/components/ui/date-time-input';
import { OnHoldCommentModal } from './on-hold-comment-modal';
import type { Application } from '@/types';
import type { ApplicationFormData } from '@/lib/schemas/application';
import type {
  ApplicationSource,
  ApplicationStatus,
  EmploymentType,
  IR35Status,
  WorkMode,
} from '@/types';

interface ApplicationFormProps {
  application?: Application;
  /** Called when the user clicks Done after a successful save. */
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
    status: (sticky?.status ?? 'discovered') as ApplicationStatus,
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
    on_hold_comment: '',
    on_hold_at: '',
    priority: 0,
  };
}

export function ApplicationForm({
  application,
  onSuccess,
}: ApplicationFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [showOnHoldModal, setShowOnHoldModal] = useState(false);
  const [pendingFormData, setPendingFormData] =
    useState<ApplicationFormData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState<{
    company: string;
    mode: 'create' | 'edit';
  } | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      company: application?.company ?? '',
      role: application?.role ?? '',
      employment_type: (application?.employment_type ??
        'permanent') as EmploymentType,
      source: (application?.source ?? 'linkedin') as ApplicationSource,
      status: (application?.status ?? 'discovered') as ApplicationStatus,
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
      on_hold_comment: application?.on_hold_comment ?? '',
      on_hold_at: application?.on_hold_at ?? '',
      priority: application?.priority ?? 0,
    },
    onSubmit: async ({ value }) => {
      // Only trigger modal for status change, and not in edit mode
      if (value.status === 'on_hold' && !application && !pendingFormData) {
        setPendingFormData(value);
        setShowOnHoldModal(true);
        return;
      }

      const payload = pendingFormData
        ? { ...pendingFormData, on_hold_comment: value.on_hold_comment }
        : value;

      setSubmitting(true);
      setError(null);

      try {
        const result = application
          ? await updateApplication(application.id, payload)
          : await createApplication(payload);

        // ... (rest of the submission logic)

        if (result.error) {
          setError(result.error);
          toast({
            title: application
              ? 'Could not update application'
              : 'Could not add application',
            description: result.error,
            variant: 'error',
          });
          setPendingFormData(null);
          return;
        }

        queryClient.invalidateQueries({ queryKey: ['applications'] });
        toast({
          title: application ? 'Application updated' : 'Application added',
          description: application
            ? `${payload.company} has been updated.`
            : `${payload.company} has been added to your funnel.`,
          variant: 'success',
        });

        if (application) {
          setJustSaved({ company: payload.company, mode: 'edit' });
          setPendingFormData(null);
          return;
        }

        // Create: reset for another entry, keep useful defaults
        form.reset(
          emptyCreateValues({
            employment_type: payload.employment_type,
            source: payload.source,
            status: payload.status,
            date_applied: payload.date_applied,
            salary_currency: payload.salary_currency,
            work_mode: payload.work_mode,
          }),
        );
        setJustSaved({ company: payload.company, mode: 'create' });
        setPendingFormData(null);
      } catch {
        // ...
        setPendingFormData(null);
      } finally {
        setSubmitting(false);
      }
    },
  });

  function handleDone() {
    setJustSaved(null);
    onSuccess?.();
  }

  function handleReset() {
    form.reset(emptyCreateValues());
    setJustSaved(null);
    setError(null);
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
      {justSaved && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-zinc-900">
                {justSaved.company}{' '}
                {justSaved.mode === 'edit' ? 'updated' : 'added'}
              </p>
              <p className="mt-0.5 text-sm text-zinc-700">
                {justSaved.mode === 'edit' ? (
                  <>Continue editing or you&apos;re done.</>
                ) : (
                  <>
                    Form cleared for another entry. Add another or you&apos;re
                    done.
                  </>
                )}
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

      {/* On-Hold Comment Modal */}
      <OnHoldCommentModal
        isOpen={showOnHoldModal}
        onClose={() => {
          setShowOnHoldModal(false);
          setPendingFormData(null);
        }}
        onConfirm={(comment, onHoldAt) => {
          form.setFieldValue('on_hold_comment', comment);
          form.setFieldValue('on_hold_at', onHoldAt);
          setShowOnHoldModal(false);
          setPendingFormData(null);
          form.handleSubmit(); // Re-trigger submission
        }}
      />

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

      {/* Source, Status and Date */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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

        <form.Field name="status">
          {(field) => (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                Status
              </label>
              <select
                value={field.state.value}
                onChange={(e) =>
                  field.handleChange(e.target.value as ApplicationStatus)
                }
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {APPLICATION_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STAGE_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
          )}
        </form.Field>

        <form.Field name="date_applied">
          {(field) => (
            <DateTimeInput
              type="date"
              label="Date Applied *"
              value={field.state.value}
              onChange={(val) => field.handleChange(val)}
            />
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
                onChange={(e) => field.handleChange(e.target.value as WorkMode)}
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

      {/* On-Hold Section */}
      <form.Subscribe selector={(state) => state.values.status}>
        {(status) =>
          status === 'on_hold' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-1">
                <form.Field name="on_hold_at">
                  {(field) => (
                    <div className="w-full sm:w-1/2">
                      <DateTimeInput
                        type="datetime-local"
                        label="On-Hold Since"
                        value={
                          field.state.value
                            ? new Date(field.state.value)
                                .toISOString()
                                .slice(0, 16)
                            : ''
                        }
                        onChange={(val) => {
                          field.handleChange(
                            val ? new Date(val).toISOString() : '',
                          );
                        }}
                      />
                    </div>
                  )}
                </form.Field>
              </div>

              <form.Field name="on_hold_comment">
                {(field) => (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                      On-Hold Comment
                    </label>
                    <textarea
                      value={field.state.value ?? ''}
                      onChange={(e) => field.handleChange(e.target.value)}
                      rows={6}
                      placeholder="Enter reason for on-hold..."
                      className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                )}
              </form.Field>
            </div>
          )
        }
      </form.Subscribe>

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
              rows={6}
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
        {!application && (
          <button
            type="button"
            onClick={handleReset}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        )}
        {justSaved && (
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
              : justSaved
                ? 'Save'
                : 'Add Application'}
        </button>
      </div>
    </form>
  );
}
