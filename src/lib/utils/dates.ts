// src/lib/utils/dates.ts

import {
  format,
  formatDistanceToNow,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
  parseISO,
} from 'date-fns';

export function formatDate(date: string): string {
  return format(parseISO(date), 'dd MMM yyyy');
}

export function timeAgo(date: string): string {
  return formatDistanceToNow(parseISO(date), { addSuffix: true });
}

export function getCurrentWeekRange(): { start: Date; end: Date } {
  const now = new Date();
  return {
    start: startOfWeek(now, { weekStartsOn: 1 }),
    end: endOfWeek(now, { weekStartsOn: 1 }),
  };
}

export function isThisWeek(date: string): boolean {
  const { start, end } = getCurrentWeekRange();
  return isWithinInterval(parseISO(date), { start, end });
}
