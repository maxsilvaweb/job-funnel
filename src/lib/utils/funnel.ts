// src/lib/utils/funnel.ts

import type {
  Application,
  FunnelStage,
  ApplicationStatus,
  TrendGranularity,
  TrendPoint,
} from '@/types';
import { FUNNEL_STAGES, STAGE_LABELS, STAGE_COLOURS } from '@/lib/constants';
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subWeeks,
  subYears,
} from 'date-fns';

/**
 * Map a status to how far through the funnel it reached.
 * An app at "tech_interview" also counts toward
 * "applied", "responded" and "screening".
 */
export function getStageIndex(status: ApplicationStatus): number {
  const progressionStages: ApplicationStatus[] = [
    'discovered',
    'applied',
    'responded',
    'screening',
    'tech_interview',
    'final_round',
    'offer',
    'accepted',
  ];

  const idx = progressionStages.indexOf(status);

  if (status === 'rejected') return 1;
  if (status === 'ghosted') return 0;
  if (status === 'withdrawn') return 1;

  return idx >= 0 ? idx : 0;
}

/**
 * Build the funnel data array from a list of applications.
 * Each progression stage count includes all applications that reached
 * AT LEAST that stage. Rejected and Ghosted are appended as outcomes
 * (absolute counts, % of total applications).
 */
export function buildFunnelData(applications: Application[]): FunnelStage[] {
  if (applications.length === 0) return [];

  const stageCounts: Record<string, number> = {};

  FUNNEL_STAGES.forEach((stage) => {
    stageCounts[stage] = 0;
  });

  applications.forEach((app) => {
    const reachedIndex = getStageIndex(app.status);
    FUNNEL_STAGES.forEach((stage, idx) => {
      if (idx <= reachedIndex) {
        stageCounts[stage]++;
      }
    });
  });

  const total = applications.length || 1;
  // Always anchor "% of top" to the first funnel stage so values stay ≤ 100
  const topOfFunnel = Math.max(stageCounts[FUNNEL_STAGES[0]] || 0, 1);

  const clampPct = (value: number) =>
    Math.max(0, Math.min(100, Math.round(value)));

  const progression: FunnelStage[] = FUNNEL_STAGES.map((stage, idx) => ({
    name: STAGE_LABELS[stage],
    count: stageCounts[stage],
    conversionFromPrevious:
      idx === 0
        ? 100
        : clampPct(
            (stageCounts[stage] / (stageCounts[FUNNEL_STAGES[idx - 1]] || 1)) *
              100,
          ),
    conversionFromTop: clampPct((stageCounts[stage] / topOfFunnel) * 100),
    colour: STAGE_COLOURS[stage],
    kind: 'progression',
  }));

  const rejectedCount = applications.filter((a) => a.status === 'rejected').length;
  const ghostedCount = applications.filter((a) => a.status === 'ghosted').length;

  const outcomes: FunnelStage[] = (
    [
      ['rejected', rejectedCount],
      ['ghosted', ghostedCount],
    ] as const
  ).map(([status, count]) => ({
    name: STAGE_LABELS[status],
    count,
    // For outcomes, share of all applications (capped at 100%)
    conversionFromPrevious: clampPct((count / total) * 100),
    conversionFromTop: clampPct((count / total) * 100),
    colour: STAGE_COLOURS[status],
    kind: 'outcome' as const,
  }));

  return [...progression, ...outcomes];
}

/**
 * What percentage of applications got any response at all.
 */
export function calculateResponseRate(applications: Application[]): number {
  if (applications.length === 0) return 0;
  const responded = applications.filter(
    (a) => a.status !== 'applied' && a.status !== 'ghosted',
  ).length;
  return Math.round((responded / applications.length) * 100);
}

/**
 * What percentage of applications have gone completely silent (ghosted).
 */
export function calculateGhostRate(applications: Application[]): number {
  if (applications.length === 0) return 0;
  const ghosted = applications.filter((a) => a.status === 'ghosted').length;
  return Math.round((ghosted / applications.length) * 100);
}

/**
 * Average number of days between applying and first response.
 */
export function calculateAverageTimeToResponse(
  applications: Application[],
): number | null {
  const withResponse = applications.filter(
    (a) =>
      a.status !== 'applied' &&
      a.status !== 'ghosted' &&
      a.stages &&
      a.stages.length > 1,
  );

  if (withResponse.length === 0) return null;

  const totalDays = withResponse.reduce((sum, app) => {
    if (!app.stages || app.stages.length < 2) return sum;
    const applied = new Date(app.stages[0].date_entered);
    const responded = new Date(app.stages[1].date_entered);
    const diff =
      (responded.getTime() - applied.getTime()) / (1000 * 60 * 60 * 24);
    return sum + diff;
  }, 0);

  return Math.round(totalDays / withResponse.length);
}

/**
 * Given your current conversion rates, how many applications
 * do you need to send to hit a target number of offers?
 */
export function applicationsNeededForOffers(
  applications: Application[],
  targetOffers: number,
): number {
  const funnel = buildFunnelData(applications);
  const offerStage = funnel.find((s) => s.name === 'Offer' && s.kind !== 'outcome');

  if (!offerStage || offerStage.conversionFromTop === 0) {
    // No data yet — use industry average of 2%
    return Math.ceil(targetOffers / 0.02);
  }

  return Math.ceil(targetOffers / (offerStage.conversionFromTop / 100));
}

const TREND_DEFAULTS: Record<TrendGranularity, number> = {
  day: 30,
  week: 12,
  month: 12,
  year: 5,
};

function periodBounds(granularity: TrendGranularity, date: Date) {
  switch (granularity) {
    case 'day':
      return { start: startOfDay(date), end: endOfDay(date) };
    case 'week':
      return {
        start: startOfWeek(date, { weekStartsOn: 1 }),
        end: endOfWeek(date, { weekStartsOn: 1 }),
      };
    case 'month':
      return { start: startOfMonth(date), end: endOfMonth(date) };
    case 'year':
      return { start: startOfYear(date), end: endOfYear(date) };
  }
}

function shiftPeriod(granularity: TrendGranularity, date: Date, amount: number) {
  switch (granularity) {
    case 'day':
      return subDays(date, amount);
    case 'week':
      return subWeeks(date, amount);
    case 'month':
      return subMonths(date, amount);
    case 'year':
      return subYears(date, amount);
  }
}

function formatPeriodLabel(granularity: TrendGranularity, start: Date) {
  switch (granularity) {
    case 'day':
      return format(start, 'd MMM');
    case 'week':
      return format(start, 'd MMM');
    case 'month':
      return format(start, 'MMM yyyy');
    case 'year':
      return format(start, 'yyyy');
  }
}

function bucketKey(granularity: TrendGranularity, date: Date) {
  const { start } = periodBounds(granularity, date);
  return format(start, 'yyyy-MM-dd');
}

/**
 * Application volume + cumulative total for the last N periods.
 * Includes empty buckets so the line chart stays continuous.
 */
export function buildApplicationTrend(
  applications: Application[],
  granularity: TrendGranularity = 'week',
  count = TREND_DEFAULTS[granularity],
): TrendPoint[] {
  const now = new Date();
  const { start: currentStart, end: rangeEnd } = periodBounds(granularity, now);

  const buckets: TrendPoint[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const start = shiftPeriod(granularity, currentStart, i);
    buckets.push({
      label: formatPeriodLabel(granularity, start),
      periodStart: format(start, 'yyyy-MM-dd'),
      applications: 0,
      cumulative: 0,
    });
  }

  const firstStart = parseISO(buckets[0].periodStart);
  const bucketByKey = new Map(buckets.map((b) => [b.periodStart, b]));

  for (const app of applications) {
    if (!app.date_applied) continue;
    const appliedAt = parseISO(app.date_applied);
    if (appliedAt < firstStart || appliedAt > rangeEnd) continue;

    const key = bucketKey(granularity, appliedAt);
    const bucket = bucketByKey.get(key);
    if (!bucket) continue;
    bucket.applications += 1;
  }

  let running = applications.filter((app) => {
    if (!app.date_applied) return false;
    return parseISO(app.date_applied) < firstStart;
  }).length;

  for (const bucket of buckets) {
    running += bucket.applications;
    bucket.cumulative = running;
  }

  return buckets;
}

/** @deprecated Prefer buildApplicationTrend(..., 'week', weekCount) */
export function buildWeeklyApplicationTrend(
  applications: Application[],
  weekCount = 12,
): TrendPoint[] {
  return buildApplicationTrend(applications, 'week', weekCount);
}
