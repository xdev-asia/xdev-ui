/** Pure pan and zoom math for a viewer (an image, a diagram). No DOM, so tests need none. */

export interface Size {
  w: number;
  h: number;
}
export interface Point {
  x: number;
  y: number;
}
/** `zoom` scales the content; `x` and `y` move its top-left corner inside the viewport. */
export interface PanZoomState extends Point {
  zoom: number;
}

export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 8;
export const ZOOM_STEP = 1.25;

/**
 * The scale at which `img` fits inside `box` minus `padding` on every side. Without `upscale` it
 * never goes above 1, so a small raster image stays sharp; a vector image passes `upscale`.
 * An empty size gives 1.
 */
export function fitScale(img: Size, box: Size, opts: { padding: number; upscale: boolean }): number {
  const w = box.w - opts.padding * 2;
  const h = box.h - opts.padding * 2;
  if (img.w <= 0 || img.h <= 0 || w <= 0 || h <= 0) return 1;
  const s = Math.min(w / img.w, h / img.h);
  return opts.upscale ? s : Math.min(1, s);
}

export function clampZoom(z: number, min = MIN_ZOOM, max = MAX_ZOOM): number {
  return Math.min(max, Math.max(min, z));
}

/** One step in (`1`) or out (`-1`), clamped. */
export function stepZoom(z: number, dir: 1 | -1, step = ZOOM_STEP, min = MIN_ZOOM, max = MAX_ZOOM): number {
  return clampZoom(dir === 1 ? z * step : z / step, min, max);
}

/**
 * Zooms by `factor` keeping the content under `point` (viewport coordinates) where it is.
 * The result is clamped to `min`..`max` (the absolute zoom, default 0.25..8), so a factor past
 * the limit changes nothing.
 */
export function zoomAt(state: PanZoomState, point: Point, factor: number, min = MIN_ZOOM, max = MAX_ZOOM): PanZoomState {
  const zoom = clampZoom(state.zoom * factor, min, max);
  const k = zoom / state.zoom;
  return { zoom, x: point.x - (point.x - state.x) * k, y: point.y - (point.y - state.y) * k };
}

/** The shown percentage: the zoom on top of the fit scale. */
export function percentOf(zoom: number, fit: number): number {
  return Math.round(zoom * fit * 100);
}

/** What a key does in a pan and zoom viewport, or null when it is not handled. */
export function zoomKey(key: string): "in" | "out" | "reset" | null {
  if (key === "+" || key === "=") return "in";
  if (key === "-" || key === "_") return "out";
  if (key === "0") return "reset";
  return null;
}

/** The zoom factor of one wheel event: smooth for a trackpad, a step for a mouse wheel. */
export function wheelFactor(deltaY: number): number {
  return Math.exp(-Math.max(-100, Math.min(100, deltaY)) * 0.0025);
}
