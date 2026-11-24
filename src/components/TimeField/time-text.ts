/** Pure helpers behind `TimeField`: parse typed time-of-day or duration text, format and step it. */

export interface TimeTextOptions {
  /** "time" (default): a time of day, 00:00 to 23:59. "duration": minutes and seconds, `mm:ss`. */
  mode?: "time" | "duration";
  /** Time mode only: `HH:mm:ss` instead of `HH:mm`. */
  seconds?: boolean;
  /** Duration mode only: the largest minutes value. Default 59. */
  maxMinutes?: number;
}

const pad = (n: number): string => String(n).padStart(2, "0");
const maxMin = (o: TimeTextOptions): number => Math.max(0, Math.floor(o.maxMinutes ?? 59));

/** Number of distinct values in the range, in seconds; stepping wraps modulo this. */
function span(o: TimeTextOptions): number {
  return o.mode === "duration" ? maxMin(o) * 60 + 60 : 24 * 3600;
}

function build(h: number, m: number, s: number, o: TimeTextOptions): string | null {
  if (![h, m, s].every(Number.isInteger) || h < 0 || m < 0 || s < 0 || s > 59) return null;
  if (o.mode === "duration") return m <= maxMin(o) ? `${pad(m)}:${pad(s)}` : null;
  if (h > 23 || m > 59) return null;
  if (!o.seconds && s !== 0) return null;
  return o.seconds ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(h)}:${pad(m)}`;
}

/**
 * Parses typed text into the normalised value (`HH:mm`, `HH:mm:ss` or `mm:ss`), or null when it is empty, malformed or out of range.
 * Fields are separated by `:` or `.`, each one or two digits (`9:5` is `09:05`; duration minutes may have more digits when `maxMinutes` allows).
 * Digits only: time mode reads 1–2 digits as hours (`9` is `09:00`), 3–4 as hours and minutes (`930` and `0930` are `09:30`)
 * and, with `seconds`, 5–6 as hours, minutes and seconds. Duration mode reads 1–2 digits as seconds (`45` is `00:45`, `90` is invalid)
 * and 3 or more as minutes then the last two digits as seconds (`130` is `01:30`). With `seconds`, `09:30` is `09:30:00`; without it a seconds field is invalid.
 */
export function parseTime(text: string, opts: TimeTextOptions = {}): string | null {
  const t = text.trim();
  if (!t) return null;
  const dur = opts.mode === "duration";
  if (/^\d+$/.test(t)) {
    const n = t.length;
    const last2 = Number(t.slice(-2));
    const head = Number(t.slice(0, -2));
    if (dur) return n <= 2 ? build(0, 0, Number(t), opts) : build(0, head, last2, opts);
    if (n <= 2) return build(Number(t), 0, 0, opts);
    if (n <= 4) return build(head, last2, 0, opts);
    if (opts.seconds && n <= 6) return build(Number(t.slice(0, -4)), Number(t.slice(-4, -2)), last2, opts);
    return null;
  }
  const parts = t.split(/[:.]/);
  if (dur) {
    if (parts.length !== 2 || !/^\d+$/.test(parts[0] ?? "") || !/^\d{1,2}$/.test(parts[1] ?? "")) return null;
    return build(0, Number(parts[0]), Number(parts[1]), opts);
  }
  if (!parts.every((p) => /^\d{1,2}$/.test(p))) return null;
  if (parts.length === 2) return build(Number(parts[0]), Number(parts[1]), 0, opts);
  if (parts.length === 3 && opts.seconds) return build(Number(parts[0]), Number(parts[1]), Number(parts[2]), opts);
  return null;
}

/** Seconds since 00:00 (time) or in the duration, for a value `parseTime` accepts; null otherwise. */
export function timeToSeconds(value: string | null | undefined, opts: TimeTextOptions = {}): number | null {
  const v = value == null ? null : parseTime(value, opts);
  if (v === null) return null;
  const [h = NaN, m = NaN, s = 0] = v.split(":").map(Number);
  if (opts.mode === "duration") return h * 60 + m;
  return h * 3600 + m * 60 + s;
}

/** Formats a number of seconds as a value, wrapped into the range (time mode without `seconds` drops the seconds). */
export function formatTime(totalSeconds: number, opts: TimeTextOptions = {}): string {
  const r = span(opts);
  const n = ((Math.floor(totalSeconds) % r) + r) % r;
  if (opts.mode === "duration") return `${pad(Math.floor(n / 60))}:${pad(n % 60)}`;
  const h = Math.floor(n / 3600);
  const m = Math.floor((n % 3600) / 60);
  return opts.seconds ? `${pad(h)}:${pad(m)}:${pad(n % 60)}` : `${pad(h)}:${pad(m)}`;
}

/**
 * Moves a value by `steps` minutes (time) or seconds (duration), wrapping within the range.
 * An empty or invalid value starts from 00:00.
 */
export function stepTime(value: string | null | undefined, steps: number, opts: TimeTextOptions = {}): string {
  const unit = opts.mode === "duration" ? 1 : 60;
  return formatTime((timeToSeconds(value, opts) ?? 0) + steps * unit, opts);
}
