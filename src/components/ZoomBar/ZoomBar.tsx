import type { JSX, KeyboardEvent } from "react";
import { cx } from "../../internal/cx";
import { rovingIndex } from "../../internal/keys";
import { IconButton } from "../IconButton/IconButton";

export interface ZoomBarLabels {
  zoomOut: string;
  zoomIn: string;
  fit: string;
  actual: string;
  /** aria-label of the group. */
  group: string;
}

const DEFAULT_LABELS: ZoomBarLabels = {
  zoomOut: "Zoom out",
  zoomIn: "Zoom in",
  fit: "Fit to view",
  actual: "Actual size",
  group: "Zoom",
};

export interface ZoomBarProps {
  /** The shown percentage, or null before the content has a size. */
  zoom: number | null;
  onZoomOut: () => void;
  onFit: () => void;
  onZoomIn: () => void;
  /** The percentage button: back to 100%. */
  onActual: () => void;
  /** Override the English defaults (e.g. for vi). */
  labels?: Partial<ZoomBarLabels>;
  className?: string;
}

const FOCUSABLE = "button:not(:disabled)";

export function ZoomBar({ zoom, onZoomOut, onFit, onZoomIn, onActual, labels, className }: ZoomBarProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE));
    const index = items.indexOf(document.activeElement as HTMLElement);
    if (index < 0) return;
    const next = rovingIndex(e.key, index, items.length);
    if (next == null) return;
    e.preventDefault();
    items[next].focus();
  };
  return (
    <div className={cx("x-zoombar", className)} role="toolbar" aria-label={l.group} onKeyDown={onKeyDown}>
      <IconButton icon="minus" label={l.zoomOut} onClick={onZoomOut} />
      <IconButton icon="maximize" label={l.fit} onClick={onFit} />
      <IconButton icon="plus" label={l.zoomIn} onClick={onZoomIn} />
      <button type="button" className="btn-secondary x-zoombar-pct" aria-label={l.actual} title={l.actual} onClick={onActual}>
        {zoom === null ? "—" : `${zoom}%`}
      </button>
    </div>
  );
}
