/**
 * Period range + bucketing helpers for the analytics dashboard.
 * Pure date math — no I/O — so the page component can resolve a
 * `?period=` search param into concrete date bounds (current + previous,
 * for trend comparisons) and then bucket raw `analytics_events` rows into
 * a small time series for the traffic/clicks chart.
 */

export type PeriodKey =
  | "today"
  | "yesterday"
  | "7days"
  | "30days"
  | "this_month"
  | "lifetime"
  | "custom";

export const PERIOD_OPTIONS: { value: PeriodKey; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "7days", label: "Last 7 Days" },
  { value: "30days", label: "Last 30 Days" },
  { value: "this_month", label: "This Month" },
  { value: "lifetime", label: "Lifetime" },
  { value: "custom", label: "Custom Date Range" },
];

export type BucketGranularity = "hour" | "day" | "month";

export interface PeriodRange {
  key: PeriodKey;
  /** Inclusive lower bound, or null for "lifetime" (no lower bound). */
  start: Date | null;
  /** Inclusive upper bound. */
  end: Date;
  /** Equal-length window immediately preceding `start`, for trend comparison. Null if not comparable. */
  prevStart: Date | null;
  prevEnd: Date | null;
  bucket: BucketGranularity;
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function addDays(d: Date, days: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

/** Resolves a period key (+ optional custom bounds) into a concrete PeriodRange. */
export function resolvePeriod(
  period: string | undefined,
  startParam?: string,
  endParam?: string,
): PeriodRange {
  const now = new Date();
  const key: PeriodKey = (PERIOD_OPTIONS.some((o) => o.value === period)
    ? period
    : "7days") as PeriodKey;

  if (key === "today") {
    const start = startOfDay(now);
    const end = now;
    const prevStart = startOfDay(addDays(now, -1));
    const prevEnd = endOfDay(addDays(now, -1));
    return { key, start, end, prevStart, prevEnd, bucket: "hour" };
  }

  if (key === "yesterday") {
    const start = startOfDay(addDays(now, -1));
    const end = endOfDay(addDays(now, -1));
    const prevStart = startOfDay(addDays(now, -2));
    const prevEnd = endOfDay(addDays(now, -2));
    return { key, start, end, prevStart, prevEnd, bucket: "hour" };
  }

  if (key === "7days") {
    const start = startOfDay(addDays(now, -6));
    const end = now;
    const prevEnd = endOfDay(addDays(start, -1));
    const prevStart = startOfDay(addDays(prevEnd, -6));
    return { key, start, end, prevStart, prevEnd, bucket: "day" };
  }

  if (key === "30days") {
    const start = startOfDay(addDays(now, -29));
    const end = now;
    const prevEnd = endOfDay(addDays(start, -1));
    const prevStart = startOfDay(addDays(prevEnd, -29));
    return { key, start, end, prevStart, prevEnd, bucket: "day" };
  }

  if (key === "this_month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = now;
    const prevMonthLastDate = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    const prevDay = Math.min(now.getDate(), prevMonthLastDate);
    const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevEnd = endOfDay(new Date(now.getFullYear(), now.getMonth() - 1, prevDay));
    return { key, start, end, prevStart, prevEnd, bucket: "day" };
  }

  if (key === "custom" && startParam && endParam) {
    const parsedStart = new Date(`${startParam}T00:00:00`);
    const parsedEnd = new Date(`${endParam}T23:59:59.999`);
    if (!Number.isNaN(parsedStart.getTime()) && !Number.isNaN(parsedEnd.getTime()) && parsedStart <= parsedEnd) {
      const start = startOfDay(parsedStart);
      const end = endOfDay(parsedEnd);
      const rangeDays = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
      const prevEnd = new Date(start.getTime() - 1);
      const prevStart = startOfDay(addDays(prevEnd, -(rangeDays - 1)));
      return {
        key,
        start,
        end,
        prevStart,
        prevEnd,
        bucket: rangeDays > 60 ? "month" : "day",
      };
    }
    // Fall through to lifetime-style defaults if custom bounds are missing/invalid.
  }

  // lifetime (and invalid custom fallback)
  return { key: "lifetime", start: null, end: now, prevStart: null, prevEnd: null, bucket: "month" };
}

export interface RawEvent {
  event_type: string;
  created_at: string;
}

const CLICK_EVENT_TYPES = new Set(["product_click", "redirect_link_click", "link_click"]);

export interface BucketSeries {
  labels: string[];
  traffic: number[];
  clicks: number[];
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Buckets events into a labeled time series matching the range's granularity. */
export function bucketEvents(events: RawEvent[], range: PeriodRange): BucketSeries {
  const { bucket } = range;

  if (bucket === "hour") {
    const start = range.start ?? startOfDay(range.end);
    const traffic = new Array(24).fill(0);
    const clicks = new Array(24).fill(0);
    const labels = Array.from({ length: 24 }, (_, h) => `${pad2(h)}:00`);
    for (const e of events) {
      const d = new Date(e.created_at);
      if (d.toDateString() !== start.toDateString()) continue;
      const h = d.getHours();
      if (e.event_type === "page_view") traffic[h] += 1;
      else if (CLICK_EVENT_TYPES.has(e.event_type)) clicks[h] += 1;
    }
    return { labels, traffic, clicks };
  }

  if (bucket === "month") {
    // Determine the month span: explicit range, or the min..max event month for lifetime.
    let spanStart: Date;
    const spanEnd = new Date(range.end.getFullYear(), range.end.getMonth(), 1);
    if (range.start) {
      spanStart = new Date(range.start.getFullYear(), range.start.getMonth(), 1);
    } else if (events.length > 0) {
      const minTs = Math.min(...events.map((e) => new Date(e.created_at).getTime()));
      const minD = new Date(minTs);
      spanStart = new Date(minD.getFullYear(), minD.getMonth(), 1);
    } else {
      spanStart = spanEnd;
    }
    const keys: string[] = [];
    const labels: string[] = [];
    const cursor = new Date(spanStart);
    // Cap at 36 months so a very old lifetime range can't blow up the chart.
    let guard = 0;
    while (cursor <= spanEnd && guard < 36) {
      const key = `${cursor.getFullYear()}-${pad2(cursor.getMonth() + 1)}`;
      keys.push(key);
      labels.push(`${MONTH_LABELS[cursor.getMonth()]} ${cursor.getFullYear()}`);
      cursor.setMonth(cursor.getMonth() + 1);
      guard += 1;
    }
    const index = new Map(keys.map((k, i) => [k, i]));
    const traffic = new Array(keys.length).fill(0);
    const clicks = new Array(keys.length).fill(0);
    for (const e of events) {
      const d = new Date(e.created_at);
      const key = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
      const i = index.get(key);
      if (i === undefined) continue;
      if (e.event_type === "page_view") traffic[i] += 1;
      else if (CLICK_EVENT_TYPES.has(e.event_type)) clicks[i] += 1;
    }
    return { labels, traffic, clicks };
  }

  // day
  const start = range.start ?? startOfDay(range.end);
  const end = range.end;
  const keys: string[] = [];
  const labels: string[] = [];
  const cursor = startOfDay(start);
  let guard = 0;
  while (cursor <= end && guard < 62) {
    const key = cursor.toDateString();
    keys.push(key);
    labels.push(`${MONTH_LABELS[cursor.getMonth()]} ${cursor.getDate()}`);
    cursor.setDate(cursor.getDate() + 1);
    guard += 1;
  }
  const index = new Map(keys.map((k, i) => [k, i]));
  const traffic = new Array(keys.length).fill(0);
  const clicks = new Array(keys.length).fill(0);
  for (const e of events) {
    const d = new Date(e.created_at);
    const i = index.get(d.toDateString());
    if (i === undefined) continue;
    if (e.event_type === "page_view") traffic[i] += 1;
    else if (CLICK_EVENT_TYPES.has(e.event_type)) clicks[i] += 1;
  }
  return { labels, traffic, clicks };
}

export function isClickEvent(eventType: string): boolean {
  return CLICK_EVENT_TYPES.has(eventType);
}

/** Percent change from prev -> curr, or null when there's no prior-period baseline to compare against. */
export function percentChange(curr: number, prev: number | null): number | null {
  if (prev === null) return null;
  if (prev === 0) return curr === 0 ? 0 : null; // "New" — can't express as a finite percent
  return Math.round(((curr - prev) / prev) * 1000) / 10;
}
