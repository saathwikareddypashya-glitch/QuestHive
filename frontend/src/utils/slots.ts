import type { AvailabilityRange, Day } from '../types';
import { fromMinutes, toMinutes, DAYS } from './formatters';

/** Generate slot start times for one weekday from a teacher's availability ranges. */
export function generateSlots(ranges: AvailabilityRange[], day: Day, durationMins: number): string[] {
  const out: string[] = [];
  ranges
    .filter((r) => r.day === day)
    .forEach((r) => {
      const s = toMinutes(r.start);
      const e = toMinutes(r.end);
      for (let t = s; t + durationMins <= e; t += durationMins) out.push(fromMinutes(t));
    });
  return Array.from(new Set(out)).sort();
}

export function teachingDays(ranges: AvailabilityRange[]): Day[] {
  return DAYS.filter((d) => ranges.some((r) => r.day === d));
}

export function rangesOverlap(a: { start: string; end: string }, b: { start: string; end: string }) {
  return toMinutes(a.start) < toMinutes(b.end) && toMinutes(b.start) < toMinutes(a.end);
}

export function weeklyHours(ranges: AvailabilityRange[]) {
  return ranges.reduce((sum, r) => sum + (toMinutes(r.end) - toMinutes(r.start)) / 60, 0);
}
