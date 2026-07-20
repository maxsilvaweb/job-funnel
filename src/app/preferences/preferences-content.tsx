// src/app/preferences/preferences-content.tsx

'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import {
  usePreferences,
  useUpdatePreferences,
} from '@/lib/hooks/use-preferences';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/lib/hooks/use-toast';

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: 'permanent', label: 'Permanent' },
  { value: 'contract', label: 'Contract' },
];

const IR35_OPTIONS = [
  { value: 'outside', label: 'Outside IR35 only' },
  { value: 'inside', label: 'Inside IR35 only' },
  { value: 'both', label: 'Both' },
];

const WORK_MODE_OPTIONS = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site' },
];

export default function PreferencesContent() {
  const { data: prefs, isLoading } = usePreferences();
  const updatePrefs = useUpdatePreferences();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [automationEnabled, setAutomationEnabled] = useState(true);
  const [minScore, setMinScore] = useState(70);
  const [employmentTypes, setEmploymentTypes] = useState<string[]>([
    'permanent',
    'contract',
  ]);
  const [ir35Preference, setIr35Preference] = useState('outside');
  const [workModes, setWorkModes] = useState<string[]>(['remote', 'hybrid']);
  const [preferredLocations, setPreferredLocations] =
    useState('Remote, London');
  const [targetRoles, setTargetRoles] = useState(
    'Senior Full Stack Engineer, Lead Full Stack Engineer',
  );
  const [targetKeywords, setTargetKeywords] = useState(
    'next.js, react, typescript, node',
  );
  const [resumeText, setResumeText] = useState('');
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyEmailAddress, setNotifyEmailAddress] = useState('');

  useEffect(() => {
    if (!prefs) return;
    setAutomationEnabled(prefs.automation_enabled);
    setMinScore(prefs.min_ai_score);
    setEmploymentTypes(prefs.employment_types);
    setIr35Preference(prefs.ir35_preference);
    setWorkModes(prefs.preferred_work_modes);
    setPreferredLocations(prefs.preferred_locations.join(', '));
    setTargetRoles(prefs.target_roles.join(', '));
    setTargetKeywords(prefs.target_keywords.join(', '));
    setResumeText(prefs.resume_text);
    setNotifyEmail(prefs.notify_email);
    setNotifyEmailAddress(prefs.notify_email_address ?? '');
  }, [prefs]);

  function toggleArrayValue(
    arr: string[],
    value: string,
    setter: (v: string[]) => void,
  ) {
    if (arr.includes(value)) {
      setter(arr.filter((v) => v !== value));
    } else {
      setter([...arr, value]);
    }
  }

  async function handleSave() {
    setSaving(true);

    try {
      await updatePrefs.mutateAsync({
        automation_enabled: automationEnabled,
        min_ai_score: minScore,
        employment_types: employmentTypes,
        ir35_preference: ir35Preference as 'inside' | 'outside' | 'both',
        preferred_work_modes: workModes,
        preferred_locations: preferredLocations
          .split(',')
          .map((l) => l.trim())
          .filter(Boolean),
        target_roles: targetRoles
          .split(',')
          .map((r) => r.trim())
          .filter(Boolean),
        target_keywords: targetKeywords
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean),
        resume_text: resumeText,
        notify_email: notifyEmail,
        notify_email_address: notifyEmailAddress || null,
      });

      toast({
        title: 'Preferences saved',
        description: 'Your automation settings have been updated.',
        variant: 'success',
      });
    } catch (err) {
      toast({
        title: 'Could not save preferences',
        description:
          err instanceof Error
            ? err.message
            : 'Something went wrong. Please try again.',
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Preferences</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Configure how the morning job hunt automation works for your account.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Automation</CardTitle>
        </CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-700">
              Morning job hunt
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">
              Automatically discover and score jobs every morning at 6am
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAutomationEnabled(!automationEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              automationEnabled ? 'bg-emerald-600' : 'bg-zinc-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                automationEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Minimum Match Score</CardTitle>
        </CardHeader>
        <p className="text-sm text-zinc-500 mb-4">
          Only jobs scoring above this threshold will appear in your dashboard.
        </p>
        <div className="mb-1 flex justify-between text-sm">
          <span className="text-zinc-600">Threshold</span>
          <span className="font-mono font-semibold text-zinc-900">
            {minScore}
          </span>
        </div>
        <input
          type="range"
          min={50}
          max={95}
          step={5}
          value={minScore}
          onChange={(e) => setMinScore(Number(e.target.value))}
          className="w-full accent-emerald-600"
        />
        <div className="mt-1 flex justify-between text-xs text-zinc-400">
          <span>50 — cast wide net</span>
          <span>95 — perfect match only</span>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Employment Type</CardTitle>
        </CardHeader>
        <div className="flex gap-3">
          {EMPLOYMENT_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() =>
                toggleArrayValue(employmentTypes, opt.value, setEmploymentTypes)
              }
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                employmentTypes.includes(opt.value)
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                  : 'border-zinc-200 text-zinc-500 hover:border-zinc-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {employmentTypes.includes('contract') && (
          <div className="mt-4">
            <p className="mb-2 text-sm font-medium text-zinc-700">
              IR35 Preference
            </p>
            <div className="flex gap-3">
              {IR35_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setIr35Preference(opt.value)}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                    ir35Preference === opt.value
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                      : 'border-zinc-200 text-zinc-500 hover:border-zinc-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Work Mode</CardTitle>
        </CardHeader>
        <div className="flex gap-3">
          {WORK_MODE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() =>
                toggleArrayValue(workModes, opt.value, setWorkModes)
              }
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                workModes.includes(opt.value)
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                  : 'border-zinc-200 text-zinc-500 hover:border-zinc-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferred Locations</CardTitle>
        </CardHeader>
        <p className="mb-3 text-sm text-zinc-500">
          Comma separated list of locations you are open to.
        </p>
        <input
          type="text"
          value={preferredLocations}
          onChange={(e) => setPreferredLocations(e.target.value)}
          placeholder="Remote, London, Manchester"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Target Roles</CardTitle>
        </CardHeader>
        <p className="mb-3 text-sm text-zinc-500">
          Comma separated list of job titles you are targeting.
        </p>
        <input
          type="text"
          value={targetRoles}
          onChange={(e) => setTargetRoles(e.target.value)}
          placeholder="Senior Full Stack Engineer, Lead Engineer"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Target Keywords</CardTitle>
        </CardHeader>
        <p className="mb-3 text-sm text-zinc-500">
          Comma separated tech keywords the AI uses to match jobs against your
          profile.
        </p>
        <input
          type="text"
          value={targetKeywords}
          onChange={(e) => setTargetKeywords(e.target.value)}
          placeholder="next.js, react, typescript, node, supabase"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Your CV / Resume</CardTitle>
        </CardHeader>
        <p className="mb-3 text-sm text-zinc-500">
          Paste your CV here. The AI uses this to score how well each job
          matches your experience.
        </p>
        <textarea
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          rows={12}
          placeholder="Paste your CV here in plain text..."
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
        />
        <p className="mt-1 text-xs text-zinc-400">
          {resumeText.length} characters
        </p>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="notify_email"
              checked={notifyEmail}
              onChange={(e) => setNotifyEmail(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label
              htmlFor="notify_email"
              className="text-sm font-medium text-zinc-700"
            >
              Send me a daily summary of discovered jobs
            </label>
          </div>

          {notifyEmail && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                Email address
              </label>
              <input
                type="email"
                value={notifyEmailAddress}
                onChange={(e) => setNotifyEmailAddress(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          )}
        </div>
      </Card>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}
