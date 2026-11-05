import type { CSSProperties, JSX } from "react";

export interface HeatmapCell {
  /** Stable key, usually the `YYYY-MM-DD` day. */
  key: string;
  /** 0 is no activity; 4 is the busiest. */
  level: 0 | 1 | 2 | 3 | 4;
  /** Text for the pointer tooltip and assistive tech, already translated. */
  label: string;
}

export interface HeatmapProps {
  /** One cell per day, oldest first. */
  cells: readonly HeatmapCell[];
  /** Row of the first cell, 0 to 6; pads the first column. */
  startWeekday?: number;
  /** Accessible name of the whole grid. */
  label: string;
  /** Legend text at the low end; the legend shows only when both ends are set. */
  lessLabel?: string;
  /** Legend text at the high end. */
  moreLabel?: string;
}

const LEVELS = [0, 1, 2, 3, 4] as const;

export function Heatmap({ cells, startWeekday = 0, label, lessLabel, moreLabel }: HeatmapProps): JSX.Element {
  const pad = Math.max(0, Math.min(6, Math.trunc(startWeekday)));
  const first: CSSProperties | undefined = pad > 0 ? { gridRowStart: pad + 1 } : undefined;
  return (
    <figure className="x-heatmap" aria-label={label}>
      <div className="x-heatmap-scroll">
        <div className="x-heatmap-grid">
          {cells.map((c, i) => (
            <span
              key={c.key}
              className="x-heatmap-cell"
              data-level={c.level}
              style={i === 0 ? first : undefined}
              title={c.label}
              role="img"
              aria-label={c.label}
            />
          ))}
        </div>
      </div>
      {lessLabel && moreLabel ? (
        <figcaption className="x-heatmap-legend" aria-hidden="true">
          <span>{lessLabel}</span>
          {LEVELS.map((l) => (
            <span key={l} className="x-heatmap-cell" data-level={l} />
          ))}
          <span>{moreLabel}</span>
        </figcaption>
      ) : null}
    </figure>
  );
}
