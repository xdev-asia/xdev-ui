import type { JSX } from "react";

export interface BarDatum {
  /** Stable key. */
  key: string;
  /** Category name, shown beside (horizontal) or under (vertical) the bar. */
  label: string;
  /** The measure; negative values draw as zero. */
  value: number;
  /** The value, already formatted ("1.2M", "$3.40"). */
  valueLabel: string;
}

export interface BarChartProps {
  /** One bar per category, in the order to draw them (usually largest first). */
  bars: readonly BarDatum[];
  /** Accessible name of the chart. */
  label: string;
  /** Horizontal bars (default) suit long category names; vertical suits a few short ones. */
  orientation?: "horizontal" | "vertical";
}

const pct = (n: number) => `${Math.round(n * 1000) / 1000}%`;

export function BarChart({ bars, label, orientation = "horizontal" }: BarChartProps): JSX.Element {
  const max = bars.reduce((m, b) => (Number.isFinite(b.value) && b.value > m ? b.value : m), 0);
  const share = (v: number) => pct(max > 0 && Number.isFinite(v) ? (Math.max(0, v) / max) * 100 : 0);
  const vertical = orientation === "vertical";
  return (
    <figure className="x-barchart" data-orientation={orientation} aria-label={label}>
      <ul className="x-barchart-list">
        {bars.map((b) => (
          <li key={b.key} className="x-barchart-item" title={`${b.label}: ${b.valueLabel}`}>
            <span className="x-barchart-label">{b.label}</span>
            <span className="x-barchart-track" aria-hidden="true">
              <span className="x-barchart-bar" style={vertical ? { height: share(b.value) } : { width: share(b.value) }} />
            </span>
            <span className="x-barchart-value">{b.valueLabel}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
