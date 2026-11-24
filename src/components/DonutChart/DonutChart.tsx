import type { JSX, ReactNode } from "react";

export interface DonutSlice {
  /** Stable key. */
  key: string;
  /** Category name, shown in the legend. */
  label: string;
  /** The measure; negative values count as zero. */
  value: number;
  /** The value, already formatted ("42%", "$3.4k"). */
  valueLabel: string;
}

export interface DonutChartProps {
  /** One slice per category, in the order to draw them clockwise from 12 o'clock (usually largest first). At most 8. */
  slices: readonly DonutSlice[];
  /** Accessible name of the chart. */
  label: string;
  /** Text in the hole, such as the total ("100%" over "Revenue"). */
  center?: ReactNode;
  /** Diameter of the ring in px. Default 160. */
  size?: number;
}

/** Categorical colours in order: distinct hues from the theme's tokens, so the ring follows light and dark. */
export const DONUT_COLORS = ["--accent", "--ok", "--orange", "--violet", "--warn", "--signal", "--danger", "--text-2"] as const;

const round = (n: number) => Math.round(n * 1000) / 1000;

/** Pure: each slice's share of 100 and where it starts, for a ring drawn with pathLength="100". */
export function donutArcs(slices: readonly DonutSlice[]): { key: string; share: number; start: number }[] {
  const values = slices.map((s) => (Number.isFinite(s.value) ? Math.max(0, s.value) : 0));
  const total = values.reduce((a, b) => a + b, 0);
  let start = 0;
  return slices.map((s, i) => {
    const share = total > 0 ? ((values[i] ?? 0) / total) * 100 : 0;
    const arc = { key: s.key, share: round(share), start: round(start) };
    start += share;
    return arc;
  });
}

export function DonutChart({ slices, label, center, size = 160 }: DonutChartProps): JSX.Element {
  const arcs = donutArcs(slices);
  // A hairline gap between slices; none when one slice fills the ring.
  const gap = arcs.filter((a) => a.share > 0).length > 1 ? 0.6 : 0;
  const color = (i: number) => `var(${DONUT_COLORS[i % DONUT_COLORS.length]})`;
  return (
    <figure className="x-donut" aria-label={label}>
      <div className="x-donut-ring" style={{ width: size, height: size }}>
        <svg viewBox="0 0 42 42" width={size} height={size} aria-hidden="true">
          <circle className="x-donut-track" cx="21" cy="21" r="15.9155" pathLength={100} />
          {arcs.map((a, i) =>
            a.share > 0 ? (
              <circle
                key={a.key}
                className="x-donut-slice"
                cx="21"
                cy="21"
                r="15.9155"
                pathLength={100}
                stroke={color(i)}
                strokeDasharray={`${round(Math.max(a.share - gap, 0.01))} ${round(100 - Math.max(a.share - gap, 0.01))}`}
                strokeDashoffset={round(25 - a.start)}
              />
            ) : null,
          )}
        </svg>
        {center ? <div className="x-donut-center">{center}</div> : null}
      </div>
      <ul className="x-donut-legend">
        {slices.map((s, i) => (
          <li key={s.key} className="x-donut-item" title={`${s.label}: ${s.valueLabel}`}>
            <span className="x-donut-swatch" aria-hidden="true" style={{ background: color(i) }} />
            <span className="x-donut-label">{s.label}</span>
            <span className="x-donut-value">{s.valueLabel}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
