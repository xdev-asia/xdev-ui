import type { JSX } from "react";

export interface TimeSeriesPoint {
  /** Stable key, usually the bucket's start time. */
  key: string;
  /** The measure in this bucket; null leaves a gap in the line (no data, not zero). */
  value: number | null;
  /** Text for the hover tooltip and the table view, already translated and formatted ("12 Nov, 1.2M tokens"). */
  label: string;
}

export interface TimeSeriesTick {
  /** Index into `points` the tick sits under. */
  index: number;
  /** Axis text, already formatted ("12 Nov", "14:00"). */
  label: string;
}

export interface TimeSeriesChartProps {
  /** One point per bucket, oldest first, evenly spaced. */
  points: readonly TimeSeriesPoint[];
  /** Accessible name of the chart; also the caption of its table view. */
  label: string;
  /** Labels along the time axis; keep them sparse (5 to 7). */
  ticks?: readonly TimeSeriesTick[];
  /** Formatted value of the top gridline; the scale's top is the largest value. */
  maxLabel?: string;
  /** Formatted value of the baseline, usually "0". */
  zeroLabel?: string;
}

/** Plot box in viewBox units; the SVG stretches to its container. */
const W = 100;
const H = 40;

const pct = (n: number) => `${Math.round(n * 1000) / 1000}%`;

const valued = (p: TimeSeriesPoint | undefined) => p !== undefined && p.value !== null && Number.isFinite(p.value);

/** Runs of consecutive non-null points, each as [index, value] pairs. */
function runs(points: readonly TimeSeriesPoint[]): [number, number][][] {
  const out: [number, number][][] = [];
  let cur: [number, number][] = [];
  points.forEach((p, i) => {
    if (p.value === null || !Number.isFinite(p.value)) {
      if (cur.length) out.push(cur);
      cur = [];
    } else cur.push([i, Math.max(0, p.value)]);
  });
  if (cur.length) out.push(cur);
  return out;
}

export function TimeSeriesChart({ points, label, ticks = [], maxLabel, zeroLabel }: TimeSeriesChartProps): JSX.Element {
  const n = points.length;
  const max = points.reduce((m, p) => (p.value !== null && Number.isFinite(p.value) && p.value > m ? p.value : m), 0);
  const x = (i: number) => ((i + 0.5) / Math.max(1, n)) * W;
  const y = (v: number) => (max > 0 ? H - (v / max) * H : H);
  const r2 = (v: number) => Math.round(v * 100) / 100;
  const segs = runs(points);
  const line = segs
    .filter((s) => s.length > 1)
    .map((s) => s.map(([i, v], k) => `${k === 0 ? "M" : "L"}${r2(x(i))} ${r2(y(v))}`).join(""))
    .join("");
  const area = segs
    .filter((s) => s.length > 1)
    .map((s) => `M${r2(x(s[0][0]))} ${H}` + s.map(([i, v]) => `L${r2(x(i))} ${r2(y(v))}`).join("") + `L${r2(x(s[s.length - 1][0]))} ${H}Z`)
    .join("");
  return (
    <figure className="x-tschart" aria-label={label}>
      <div className="x-tschart-plot">
        <svg className="x-tschart-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <line className="x-tschart-grid" x1="0" x2={W} y1="0" y2="0" />
          <line className="x-tschart-grid" x1="0" x2={W} y1={H / 2} y2={H / 2} />
          <line className="x-tschart-base" x1="0" x2={W} y1={H} y2={H} />
          {area ? <path className="x-tschart-area" d={area} /> : null}
          {line ? <path className="x-tschart-line" d={line} /> : null}
        </svg>
        {maxLabel ? <span className="x-tschart-max" aria-hidden="true">{maxLabel}</span> : null}
        {zeroLabel ? <span className="x-tschart-zero" aria-hidden="true">{zeroLabel}</span> : null}
        <div className="x-tschart-cols" aria-hidden="true">
          {points.map((p, i) => {
            const has = valued(p);
            // A point with no neighbour draws no line, so its dot always shows.
            const alone = has && !valued(points[i - 1]) && !valued(points[i + 1]);
            return (
              <span key={p.key} className="x-tschart-col" data-side={i < n / 2 ? "start" : "end"}>
                {has ? (
                  <span
                    className="x-tschart-dot"
                    data-alone={alone ? "" : undefined}
                    style={{ bottom: pct(max > 0 ? (Math.max(0, p.value as number) / max) * 100 : 0) }}
                  />
                ) : null}
                <span className="x-tschart-tip">{p.label}</span>
              </span>
            );
          })}
        </div>
      </div>
      {ticks.length ? (
        <div className="x-tschart-ticks" aria-hidden="true">
          {ticks
            .filter((t) => t.index >= 0 && t.index < n)
            .map((t) => (
              <span key={t.index} className="x-tschart-tick" data-align={t.index === 0 ? "start" : t.index === n - 1 ? "end" : "center"} style={{ left: pct(x(t.index)) }}>
                {t.label}
              </span>
            ))}
        </div>
      ) : null}
      <table className="x-sr-only">
        <caption>{label}</caption>
        <tbody>
          {points.map((p) => (
            <tr key={p.key}>
              <td>{p.label}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
