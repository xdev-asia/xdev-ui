/**
 * Pure calendar helpers for DatePicker and DateRangePicker. Dates are ISO `YYYY-MM-DD` strings.
 * Arithmetic runs on day numbers (days since 1970-01-01), never through `new Date(isoString)`,
 * so no time zone or DST can shift a day. Names come from `Intl` with `timeZone: "UTC"`.
 */

/** 0 = Sunday … 6 = Saturday. */
export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface DateRange {
  start: string | null;
  end: string | null;
}

export interface Ymd {
  y: number;
  /** 1–12 */
  m: number;
  d: number;
}

const pad = (n: number, w = 2): string => String(n).padStart(w, "0");

export function isLeapYear(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

/** Days in month `m` (1–12) of year `y`. */
export function daysInMonth(y: number, m: number): number {
  return [31, isLeapYear(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
}

export function isValidYmd(y: number, m: number, d: number): boolean {
  return Number.isInteger(y) && Number.isInteger(m) && Number.isInteger(d) && y >= 1 && y <= 9999 && m >= 1 && m <= 12 && d >= 1 && d <= daysInMonth(y, m);
}

export function toIso(y: number, m: number, d: number): string {
  return `${pad(y, 4)}-${pad(m)}-${pad(d)}`;
}

/** Parses a strict `YYYY-MM-DD`; null for anything else or an impossible day. */
export function parseIso(iso: string | null | undefined): Ymd | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? "");
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  return isValidYmd(y, mo, d) ? { y, m: mo, d } : null;
}

export function isIso(iso: string | null | undefined): iso is string {
  return parseIso(iso) !== null;
}

/** Days since 1970-01-01 (proleptic Gregorian). */
export function toDayNumber(y: number, m: number, d: number): number {
  const yy = m <= 2 ? y - 1 : y;
  const era = Math.floor(yy / 400);
  const yoe = yy - era * 400;
  const doy = Math.floor((153 * ((m + 9) % 12) + 2) / 5) + d - 1;
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
  return era * 146097 + doe - 719468;
}

export function fromDayNumber(n: number): Ymd {
  const z = n + 719468;
  const era = Math.floor(z / 146097);
  const doe = z - era * 146097;
  const yoe = Math.floor((doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365);
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
  const mp = Math.floor((5 * doy + 2) / 153);
  const d = doy - Math.floor((153 * mp + 2) / 5) + 1;
  const m = mp < 10 ? mp + 3 : mp - 9;
  return { y: yoe + era * 400 + (m <= 2 ? 1 : 0), m, d };
}

function must(iso: string): Ymd {
  const p = parseIso(iso);
  if (!p) throw new RangeError(`Not an ISO date: ${iso}`);
  return p;
}

const dayNum = (iso: string): number => {
  const { y, m, d } = must(iso);
  return toDayNumber(y, m, d);
};
const fromNum = (n: number): string => {
  const { y, m, d } = fromDayNumber(n);
  return toIso(y, m, d);
};

/** The local calendar date of `now` (a `Date` built by the caller, e.g. for the `today` default). */
export function isoFromDate(now: Date): string {
  return toIso(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export function addDays(iso: string, n: number): string {
  return fromNum(dayNum(iso) + n);
}

/** Adds months, keeping the day when it exists and using the last day of the month otherwise (31 Jan + 1 → 28/29 Feb). */
export function addMonths(iso: string, n: number): string {
  const { y, m, d } = must(iso);
  const total = y * 12 + (m - 1) + n;
  const ny = Math.floor(total / 12);
  const nm = total - ny * 12 + 1;
  return toIso(ny, nm, Math.min(d, daysInMonth(ny, nm)));
}

export function addYears(iso: string, n: number): string {
  return addMonths(iso, n * 12);
}

/** -1, 0 or 1. */
export function compareIso(a: string, b: string): -1 | 0 | 1 {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Keeps `iso` inside [min, max]; either bound may be missing. */
export function clampIso(iso: string, min?: string | null, max?: string | null): string {
  if (min && iso < min) return min;
  if (max && iso > max) return max;
  return iso;
}

export function dayOfWeek(iso: string): WeekDay {
  return ((((dayNum(iso) + 4) % 7) + 7) % 7) as WeekDay; // 1970-01-01 was a Thursday
}

export function startOfWeek(iso: string, weekStartsOn: WeekDay = 1): string {
  return addDays(iso, -((dayOfWeek(iso) - weekStartsOn + 7) % 7));
}

export function endOfWeek(iso: string, weekStartsOn: WeekDay = 1): string {
  return addDays(startOfWeek(iso, weekStartsOn), 6);
}

export function startOfMonth(iso: string): string {
  const { y, m } = must(iso);
  return toIso(y, m, 1);
}

export function sameMonth(a: string, b: string): boolean {
  return a.slice(0, 7) === b.slice(0, 7);
}

/** Six weeks of seven ISO days covering month `m` (1–12) of `y`, starting on `weekStartsOn`. */
export function monthGrid(y: number, m: number, weekStartsOn: WeekDay = 1): string[][] {
  const first = startOfWeek(toIso(y, m, 1), weekStartsOn);
  const base = dayNum(first);
  return Array.from({ length: 6 }, (_, w) => Array.from({ length: 7 }, (_, d) => fromNum(base + w * 7 + d)));
}

/** Whether `iso` cannot be picked: outside [min, max] or rejected by `isDateDisabled`. */
export function isDayDisabled(iso: string, min?: string | null, max?: string | null, isDateDisabled?: (iso: string) => boolean): boolean {
  return (!!min && iso < min) || (!!max && iso > max) || !!isDateDisabled?.(iso);
}

/**
 * Where the focused day moves for a key in the calendar grid, or null when the key is not a move.
 * Arrows ±1 / ±7 days, Home / End the week's first / last day, PageUp / PageDown ±1 month, with Shift ±1 year.
 */
export function gridKey(key: string, iso: string, opts: { shiftKey?: boolean; weekStartsOn?: WeekDay } = {}): string | null {
  const ws = opts.weekStartsOn ?? 1;
  switch (key) {
    case "ArrowLeft":
      return addDays(iso, -1);
    case "ArrowRight":
      return addDays(iso, 1);
    case "ArrowUp":
      return addDays(iso, -7);
    case "ArrowDown":
      return addDays(iso, 7);
    case "Home":
      return startOfWeek(iso, ws);
    case "End":
      return endOfWeek(iso, ws);
    case "PageUp":
      return opts.shiftKey ? addYears(iso, -1) : addMonths(iso, -1);
    case "PageDown":
      return opts.shiftKey ? addYears(iso, 1) : addMonths(iso, 1);
    default:
      return null;
  }
}

/** Splits a display pattern ("dd/mm/yyyy", "yyyy-mm-dd", "mm.dd.yyyy") into field order and separator. */
function readPattern(format: string): { order: ("d" | "m" | "y")[]; sep: string } | null {
  const parts = format.toLowerCase().match(/(yyyy|mm|dd)|[^a-z]+/g) ?? [];
  const order = parts.filter((p) => p === "yyyy" || p === "mm" || p === "dd").map((p) => p[0] as "d" | "m" | "y");
  if (order.length !== 3 || new Set(order).size !== 3) return null;
  const sep = parts.find((p) => !/^(yyyy|mm|dd)$/.test(p)) ?? "/";
  return { order, sep };
}

/** Formats an ISO date with a pattern of `dd`, `mm` and `yyyy` (default `dd/mm/yyyy`); "" for an invalid date. */
export function formatDate(iso: string | null | undefined, format = "dd/mm/yyyy"): string {
  const p = parseIso(iso);
  const pat = readPattern(format);
  if (!p || !pat) return "";
  const field = { d: pad(p.d), m: pad(p.m), y: pad(p.y, 4) };
  return pat.order.map((k) => field[k]).join(pat.sep);
}

/**
 * Parses typed text in the field order of `format` (default `dd/mm/yyyy`). Accepts one- or two-digit
 * day and month, a four-digit year and `/`, `-` or `.` as separators. Returns ISO, or null when the text
 * is not a real date (31/02/2025).
 */
export function parseDateText(text: string, format = "dd/mm/yyyy"): string | null {
  const pat = readPattern(format);
  const parts = text.trim().split(/\s*[/.-]\s*/);
  if (!pat || parts.length !== 3) return null;
  const v: Record<"d" | "m" | "y", string> = { d: "", m: "", y: "" };
  pat.order.forEach((k, i) => (v[k] = parts[i]));
  if (!/^\d{1,2}$/.test(v.d) || !/^\d{1,2}$/.test(v.m) || !/^\d{4}$/.test(v.y)) return null;
  const [y, m, d] = [Number(v.y), Number(v.m), Number(v.d)];
  return isValidYmd(y, m, d) ? toIso(y, m, d) : null;
}

/** Orders two days so start ≤ end. */
export function orderRange(a: string, b: string): { start: string; end: string } {
  return a <= b ? { start: a, end: b } : { start: b, end: a };
}

/**
 * A click in a range calendar. With no pending start it starts a new range; otherwise it closes the
 * range, swapping the ends when the second day is earlier. `done` is true once both ends are set.
 */
export function pickRange(pending: string | null, iso: string): { range: { start: string; end: string | null }; pending: string | null; done: boolean } {
  if (pending === null) return { range: { start: iso, end: null }, pending: iso, done: false };
  return { range: orderRange(pending, iso), pending: null, done: true };
}

/** Whether `iso` lies strictly between the range ends (both set). */
export function isBetween(iso: string, start: string | null, end: string | null): boolean {
  if (!start || !end) return false;
  const { start: s, end: e } = orderRange(start, end);
  return iso > s && iso < e;
}

const utc = (iso: string): Date => {
  const { y, m, d } = must(iso);
  return new Date(Date.UTC(y, m - 1, d));
};

/** "November 2026" in `locale`. */
export function monthTitle(y: number, m: number, locale = "en"): string {
  return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "UTC" }).format(utc(toIso(y, m, 1)));
}

/** Seven weekday names starting on `weekStartsOn`, `short` ("Mon") and `long` ("Monday"). */
export function weekdayNames(locale = "en", weekStartsOn: WeekDay = 1): { short: string; long: string }[] {
  const short = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" });
  const long = new Intl.DateTimeFormat(locale, { weekday: "long", timeZone: "UTC" });
  // 2024-01-07 was a Sunday.
  return Array.from({ length: 7 }, (_, i) => {
    const date = utc(addDays("2024-01-07", (weekStartsOn + i) % 7));
    return { short: short.format(date), long: long.format(date) };
  });
}

/** Full spoken date ("Friday, November 6, 2026") for a day's accessible name. */
export function dayLabel(iso: string, locale = "en"): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: "full", timeZone: "UTC" }).format(utc(iso));
}

/**
 * First month to show (as its 1st day) so `focused` stays visible in a calendar of `months` months
 * whose first month is `view`. Unchanged while it is visible.
 */
export function keepInView(view: string, focused: string, months = 1): string {
  const first = startOfMonth(view);
  if (focused < first) return startOfMonth(focused);
  if (focused >= addMonths(first, months)) return addMonths(startOfMonth(focused), 1 - months);
  return first;
}
