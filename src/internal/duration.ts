/** English short duration: "42 s", "5 min", "2 h 5 min", "3 d". Pass a translated formatter through a component's `labels`. */
export function formatDuration(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return m % 60 ? `${h} h ${m % 60} min` : `${h} h`;
  return `${Math.floor(h / 24)} d`;
}

/** Epoch ms from a number, a Date or a date string; NaN when unparsable. */
export function toEpoch(v: number | string | Date): number {
  return typeof v === "number" ? v : v instanceof Date ? v.getTime() : Date.parse(v);
}
