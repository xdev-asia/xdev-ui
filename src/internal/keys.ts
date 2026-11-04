/** Keyboard helpers shared by roving-tabindex widgets (Tabs, TreeView, Toolbar, SplitHandle). Pure, so tests need no DOM. */

/**
 * Next index for a one-dimensional roving group, or null when the key is not handled.
 * Skips indexes where `disabled(i)` is true and wraps at the ends.
 */
export function rovingIndex(
  key: string,
  index: number,
  count: number,
  orientation: "horizontal" | "vertical" = "horizontal",
  disabled: (i: number) => boolean = () => false,
): number | null {
  if (count <= 0) return null;
  const prev = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";
  const next = orientation === "horizontal" ? "ArrowRight" : "ArrowDown";
  const step = (from: number, dir: 1 | -1): number => {
    for (let n = 1; n <= count; n++) {
      const i = (((from + dir * n) % count) + count) % count;
      if (!disabled(i)) return i;
    }
    return index;
  };
  if (key === next) return step(index, 1);
  if (key === prev) return step(index, -1);
  if (key === "Home") return step(-1, 1);
  if (key === "End") return step(count, -1);
  return null;
}

/** Clamps `v` into [min, max]. */
export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

/**
 * New size for a resize handle after a key press, or null when the key is not handled.
 * `axis` "x" uses Left/Right, "y" uses Up/Down. `reverse` flips them for panels that grow
 * toward the start (a right-docked panel grows when its handle moves left).
 */
export function resizeKey(
  key: string,
  value: number,
  opts: { min: number; max: number; step: number; big: boolean; axis: "x" | "y"; reverse?: boolean },
): number | null {
  const { min, max, axis, reverse = false } = opts;
  const step = opts.big ? opts.step * 4 : opts.step;
  const grow = axis === "x" ? (reverse ? "ArrowLeft" : "ArrowRight") : reverse ? "ArrowUp" : "ArrowDown";
  const shrink = axis === "x" ? (reverse ? "ArrowRight" : "ArrowLeft") : reverse ? "ArrowDown" : "ArrowUp";
  if (key === grow) return clamp(value + step, min, max);
  if (key === shrink) return clamp(value - step, min, max);
  if (key === "Home") return min;
  if (key === "End") return max;
  return null;
}
