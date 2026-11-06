/** Pure helpers behind DataTable row reorder. No DOM, so tests need none. */

/** Returns a copy of `array` with the item at `from` moved to `to`. `to` is clamped into range; a bad `from` returns an unchanged copy. */
export function moveItem<T>(array: readonly T[], from: number, to: number): T[] {
  const out = [...array];
  if (!Number.isInteger(from) || from < 0 || from >= out.length) return out;
  const target = Math.min(Math.max(0, Math.trunc(to)), out.length - 1);
  const [item] = out.splice(from, 1);
  out.splice(target, 0, item);
  return out;
}

/** A row lifted with the keyboard: it started at `from` and now sits at `at`. */
export interface ReorderLift {
  from: number;
  at: number;
}
export type ReorderKeyState = ReorderLift | null;

export type ReorderKeyEvent =
  | { type: "lift"; from: number }
  | { type: "move"; from: number; to: number }
  | { type: "drop"; from: number; to: number }
  | { type: "cancel"; from: number };

export interface ReorderKeyResult {
  state: ReorderKeyState;
  /** What to announce (and, for "drop", to commit). Null when nothing changed. */
  event: ReorderKeyEvent | null;
  /** False when the key is not part of the reorder pattern; the caller leaves it to the browser. */
  handled: boolean;
}

const isAction = (key: string): boolean => key === " " || key === "Enter" || key === "Spacebar";

/**
 * Keyboard reorder as a reducer. Space or Enter lifts the row at `index`; while lifted,
 * ArrowUp/ArrowDown (Home/End) move it, Space or Enter drops it, Escape cancels.
 */
export function reorderKeyStep(state: ReorderKeyState, key: string, index: number, count: number): ReorderKeyResult {
  if (!state) {
    if (isAction(key) && count > 0 && index >= 0 && index < count) return { state: { from: index, at: index }, event: { type: "lift", from: index }, handled: true };
    return { state, event: null, handled: false };
  }
  const last = Math.max(0, count - 1);
  let at: number | null = null;
  if (key === "ArrowUp") at = Math.max(0, state.at - 1);
  else if (key === "ArrowDown") at = Math.min(last, state.at + 1);
  else if (key === "Home") at = 0;
  else if (key === "End") at = last;
  if (at != null) return { state: { from: state.from, at }, event: at === state.at ? null : { type: "move", from: state.from, to: at }, handled: true };
  if (isAction(key)) return { state: null, event: { type: "drop", from: state.from, to: state.at }, handled: true };
  if (key === "Escape") return { state: null, event: { type: "cancel", from: state.from }, handled: true };
  return { state, event: null, handled: false };
}

/** Insertion slot (0..rows) for a pointer at `y`: the number of row midpoints above it. */
export function reorderSlot(y: number, mids: readonly number[]): number {
  let slot = 0;
  for (const m of mids) if (y > m) slot++;
  return slot;
}

/** Final index of a row dragged from `from` and dropped into insertion `slot`. */
export function slotToIndex(from: number, slot: number): number {
  return slot > from ? slot - 1 : slot;
}
