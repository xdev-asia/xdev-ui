/**
 * Roving tabindex for composites whose items are arbitrary children (Toolbar, ZoomBar): one Tab stop, arrows move inside.
 * DOM based, so it works for any child control. Pure of React: callers pass the handlers to the container.
 */
import { rovingIndex } from "./keys";

/** Controls that take part in a toolbar's arrow-key ring. */
export const ROVING_ITEMS = "button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), [role='button'][tabindex]";

interface Stop {
  tabIndex: number;
  focus: () => void;
}
interface Ring {
  querySelectorAll: (selector: string) => ArrayLike<Stop>;
}

const remembered = new WeakMap<object, unknown>();

/** Gives `active` tabIndex 0 and every other item -1. */
export function setRovingStop(items: ArrayLike<Stop>, active: unknown): void {
  for (const it of Array.from(items)) it.tabIndex = it === active ? 0 : -1;
}

/** Callback ref: makes the container a single Tab stop (the last focused item, else the first). */
export function rovingRef(el: (object & Ring) | null): void {
  if (!el) return;
  const items = Array.from(el.querySelectorAll(ROVING_ITEMS));
  const last = remembered.get(el);
  setRovingStop(items, items.includes(last as Stop) ? last : items[0]);
}

/** onFocus (bubbles): the focused item becomes the Tab stop. */
export function rovingFocus(e: { target: unknown; currentTarget: Ring }): void {
  const items = Array.from(e.currentTarget.querySelectorAll(ROVING_ITEMS));
  if (!items.includes(e.target as Stop)) return;
  remembered.set(e.currentTarget, e.target);
  setRovingStop(items, e.target);
}

/** onKeyDown for a horizontal toolbar: Left, Right, Home and End move focus inside the ring. */
export function rovingKeyDown(e: { key: string; preventDefault: () => void; currentTarget: Ring }): void {
  const items = Array.from(e.currentTarget.querySelectorAll(ROVING_ITEMS));
  const index = items.indexOf(document.activeElement as unknown as Stop);
  if (index < 0) return;
  const next = rovingIndex(e.key, index, items.length);
  if (next == null) return;
  e.preventDefault();
  items[next].focus();
}
