/** Selector for elements that take part in the Tab order. */
export const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface FocusRoot {
  querySelectorAll: (selector: string) => ArrayLike<HTMLElement>;
  focus?: () => void;
}

/** Tabbable descendants of `root`, in DOM order. */
export function focusableIn(root: FocusRoot | null | undefined): HTMLElement[] {
  return root ? Array.from(root.querySelectorAll(FOCUSABLE)) : [];
}

/** Moves focus to the first tabbable descendant, or to `root` itself when there is none. */
export function focusFirst(root: (FocusRoot & { focus: () => void }) | null | undefined): void {
  if (!root) return;
  (focusableIn(root)[0] ?? root).focus();
}

/**
 * Where Tab (or Shift+Tab with `shift`) should go to stay inside a trap.
 * Returns the element to focus, or null when the browser's default move is fine.
 */
export function trapTarget<T>(items: readonly T[], active: unknown, shift: boolean): T | null {
  if (items.length === 0) return null;
  const first = items[0];
  const last = items[items.length - 1];
  const idx = items.indexOf(active as T);
  if (idx === -1) return shift ? last : first; // focus is on the container or outside
  if (shift && active === first) return last;
  if (!shift && active === last) return first;
  return null;
}

/** Focuses `trigger` if it can still take focus. */
export function restoreFocus(trigger: { focus?: () => void } | null | undefined): void {
  trigger?.focus?.();
}

type InertEl = { inert: boolean; tagName?: string; parentElement: InertEl | null; children: ArrayLike<unknown> };

/**
 * Sets `inert` on every sibling of `node` and of each ancestor up to the root,
 * so only `node` stays interactive. Returns a function that undoes it.
 */
export function inertOutside(node: HTMLElement | null | undefined): () => void {
  const changed: InertEl[] = [];
  let cur = (node as unknown as InertEl | null | undefined) ?? null;
  while (cur && cur.parentElement) {
    const parent: InertEl = cur.parentElement;
    for (const child of Array.from(parent.children)) {
      const sib = child as InertEl;
      if (sib === cur || sib.inert || sib.tagName === "SCRIPT") continue;
      sib.inert = true;
      changed.push(sib);
    }
    cur = parent;
  }
  return () => {
    for (const el of changed) el.inert = false;
  };
}
