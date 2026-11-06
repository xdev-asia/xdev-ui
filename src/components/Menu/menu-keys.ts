/** Keyboard helpers behind MenuButton (WAI-ARIA menu button pattern). Pure, so tests need no DOM. */
import { rovingIndex } from "../../internal/keys";

/**
 * Which item gets focus when `key` on the trigger opens the menu, or null when the key does not open it.
 * Enter and Space are left to the button: its native click opens the menu on the first item.
 */
export function menuTriggerKey(key: string): "first" | "last" | null {
  if (key === "ArrowDown") return "first";
  if (key === "ArrowUp") return "last";
  return null;
}

export type MenuKeyAction =
  /** Move focus to the item at `index`. */
  | { type: "focus"; index: number }
  /** Escape: close and put focus back on the trigger. */
  | { type: "close" }
  /** Tab: close, put focus back on the trigger and let the browser move it on. */
  | { type: "tab" };

/** What a key does inside an open menu whose focused item is `index` (-1: none) of `count`. Null: not handled. */
export function menuKeyStep(key: string, index: number, count: number): MenuKeyAction | null {
  if (key === "Escape" || key === "Esc") return { type: "close" };
  if (key === "Tab") return { type: "tab" };
  const next = rovingIndex(key, index, count, "vertical");
  return next == null ? null : { type: "focus", index: next };
}

/**
 * Typeahead: the first item after `from` (wrapping) whose label starts with `query`. A query of more than one
 * character also accepts the current item, so typing "de" stays on "Delete". Null when nothing matches.
 */
export function menuTypeahead(labels: readonly string[], from: number, query: string): number | null {
  const q = query.toLocaleLowerCase();
  if (!q || labels.length === 0) return null;
  const start = q.length > 1 ? Math.max(0, from) : from + 1;
  for (let n = 0; n < labels.length; n++) {
    const i = (((start + n) % labels.length) + labels.length) % labels.length;
    if (labels[i].toLocaleLowerCase().startsWith(q)) return i;
  }
  return null;
}
