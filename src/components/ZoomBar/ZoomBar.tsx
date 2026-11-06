import type { JSX } from "react";
import { cx } from "../../internal/cx";
import { rovingFocus, rovingKeyDown, rovingRef } from "../../internal/roving";
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

export function ZoomBar({ zoom, onZoomOut, onFit, onZoomIn, onActual, labels, className }: ZoomBarProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  return (
    <div className={cx("x-zoombar", className)} role="toolbar" aria-label={l.group} ref={rovingRef} onFocus={rovingFocus} onKeyDown={rovingKeyDown}>
      <IconButton icon="minus" label={l.zoomOut} onClick={onZoomOut} />
      <IconButton icon="maximize" label={l.fit} onClick={onFit} />
      <IconButton icon="plus" label={l.zoomIn} onClick={onZoomIn} />
      <button type="button" className="btn-secondary x-zoombar-pct" aria-label={l.actual} title={l.actual} onClick={onActual}>
        {zoom === null ? "—" : `${zoom}%`}
      </button>
    </div>
  );
}
