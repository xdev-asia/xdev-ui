/** Side of the anchor the card sits on. "start" is the left and "end" the right (left-to-right layouts). */
export type CoachmarkPlacement = "top" | "bottom" | "start" | "end";

/** The parts of a DOMRect the placement reads. */
export interface RectLike {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface CoachmarkSize {
  width: number;
  height: number;
}

export interface CoachmarkPosition {
  top: number;
  left: number;
  /** The side actually used: the preferred one, or the opposite one when only that fits. */
  placement: CoachmarkPlacement;
  /** Offset of the arrow along the card edge that faces the anchor, in px. */
  arrow: number;
}

/** Space kept between the card and the viewport edge (--x-space-2). */
export const COACHMARK_MARGIN = 8;
/** Space between the anchor and the card, room for the arrow (--x-space-3). */
export const COACHMARK_GAP = 12;
/** The arrow stays this far from the card corners. */
const ARROW_INSET = 16;

const OPPOSITE: Record<CoachmarkPlacement, CoachmarkPlacement> = { top: "bottom", bottom: "top", start: "end", end: "start" };

function clamp(value: number, lo: number, hi: number): number {
  return hi < lo ? lo : Math.min(Math.max(value, lo), hi);
}

function at(anchor: RectLike, size: CoachmarkSize, side: CoachmarkPlacement): { top: number; left: number } {
  const midX = anchor.left + anchor.width / 2;
  const midY = anchor.top + anchor.height / 2;
  switch (side) {
    case "bottom":
      return { top: anchor.top + anchor.height + COACHMARK_GAP, left: midX - size.width / 2 };
    case "top":
      return { top: anchor.top - COACHMARK_GAP - size.height, left: midX - size.width / 2 };
    case "end":
      return { top: midY - size.height / 2, left: anchor.left + anchor.width + COACHMARK_GAP };
    case "start":
      return { top: midY - size.height / 2, left: anchor.left - COACHMARK_GAP - size.width };
  }
}

/**
 * Where a card of `size` goes next to `anchor` inside `viewport`: the preferred side when it fits,
 * else the opposite side when that fits, else the preferred side. The result is clamped into the
 * viewport with COACHMARK_MARGIN. Null when there is no anchor or it has no size (hidden).
 */
export function placeCoachmark(anchor: RectLike | null | undefined, size: CoachmarkSize, viewport: CoachmarkSize, placement: CoachmarkPlacement = "bottom"): CoachmarkPosition | null {
  if (!anchor || (anchor.width <= 0 && anchor.height <= 0)) return null;
  const vertical = placement === "top" || placement === "bottom";
  const m = COACHMARK_MARGIN;
  // Only the axis that points away from the anchor decides the side; the other one is clamped.
  const fits = (p: { top: number; left: number }): boolean =>
    vertical ? p.top >= m && p.top + size.height <= viewport.height - m : p.left >= m && p.left + size.width <= viewport.width - m;
  let side = placement;
  let pos = at(anchor, size, side);
  if (!fits(pos)) {
    const flipped = at(anchor, size, OPPOSITE[side]);
    if (fits(flipped)) {
      side = OPPOSITE[side];
      pos = flipped;
    }
  }
  const top = clamp(pos.top, m, viewport.height - m - size.height);
  const left = clamp(pos.left, m, viewport.width - m - size.width);
  const arrow = vertical
    ? clamp(anchor.left + anchor.width / 2 - left, ARROW_INSET, size.width - ARROW_INSET)
    : clamp(anchor.top + anchor.height / 2 - top, ARROW_INSET, size.height - ARROW_INSET);
  return { top, left, placement: side, arrow };
}
