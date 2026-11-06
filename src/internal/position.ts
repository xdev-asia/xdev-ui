/** Where a floating panel (Popover, MenuButton) goes against its anchor. Pure, so tests need no DOM. */

export interface FloatRect {
  top: number;
  left: number;
  bottom: number;
  right: number;
  width: number;
  height: number;
}
export type FloatSide = "bottom" | "top";
export type FloatAlign = "start" | "end";

export interface FloatOptions {
  /** Preferred side; it flips when the other side has more room and this one is too short. Default "bottom". */
  side?: FloatSide;
  /** Which anchor edge the panel lines up with. Default "start". */
  align?: FloatAlign;
  /** Space between anchor and panel. Default 4 (--x-space-1). */
  gap?: number;
  /** Minimum distance from the viewport edges. Default 8. */
  margin?: number;
}

/** Viewport position (for `position: fixed`) of a panel of `panel` size next to `anchor`. */
export function placeFloating(
  anchor: FloatRect,
  panel: { width: number; height: number },
  viewport: { width: number; height: number },
  { side = "bottom", align = "start", gap = 4, margin = 8 }: FloatOptions = {},
): { top: number; left: number; side: FloatSide } {
  const below = viewport.height - anchor.bottom - gap - margin;
  const above = anchor.top - gap - margin;
  let actual: FloatSide = side;
  if (side === "bottom" && panel.height > below && above > below) actual = "top";
  else if (side === "top" && panel.height > above && below > above) actual = "bottom";
  const top = actual === "bottom" ? anchor.bottom + gap : anchor.top - gap - panel.height;
  const wanted = align === "start" ? anchor.left : anchor.right - panel.width;
  const left = Math.max(margin, Math.min(wanted, viewport.width - panel.width - margin));
  return { top, left, side: actual };
}

/** Positions `panel` (position: fixed) against `anchor` from their live boxes. No-op when either is missing. */
export function positionPanel(anchor: Element | null | undefined, panel: HTMLElement | null | undefined, opts?: FloatOptions): FloatSide | null {
  if (!anchor || !panel) return null;
  const p = placeFloating(
    anchor.getBoundingClientRect(),
    { width: panel.offsetWidth, height: panel.offsetHeight },
    { width: window.innerWidth, height: window.innerHeight },
    opts,
  );
  panel.style.top = `${p.top}px`;
  panel.style.left = `${p.left}px`;
  panel.dataset.side = p.side;
  return p.side;
}

/** Calls `fn` on window resize and on any scroll (capture), until the returned function runs. */
export function onViewportChange(fn: () => void): () => void {
  window.addEventListener("resize", fn);
  window.addEventListener("scroll", fn, true);
  return () => {
    window.removeEventListener("resize", fn);
    window.removeEventListener("scroll", fn, true);
  };
}
