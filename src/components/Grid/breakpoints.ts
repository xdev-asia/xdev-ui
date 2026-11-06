import { useSyncExternalStore } from "react";

/** Breakpoint widths in px, the same as `--x-bp-*` in tokens.json and Tailwind's `sm:`…`2xl:`. */
export const BREAKPOINTS = { sm: 640, md: 768, lg: 1024, xl: 1280, "2xl": 1536 } as const;

export type Breakpoint = keyof typeof BREAKPOINTS;
/** "base" is below `sm`. */
export type BreakpointOrBase = "base" | Breakpoint;
/** One value, or one value per breakpoint (mobile first: a key applies from that width up). */
export type Responsive<T> = T | Partial<Record<BreakpointOrBase, T>>;

const ORDER: Breakpoint[] = ["sm", "md", "lg", "xl", "2xl"];

/** Largest breakpoint whose min-width fits `width` (px). Pure. */
export function breakpointFor(width: number): BreakpointOrBase {
  let found: BreakpointOrBase = "base";
  for (const bp of ORDER) if (width >= BREAKPOINTS[bp]) found = bp;
  return found;
}

/** True when the viewport is at least `bp`. `current` comes from `useBreakpoint()`. */
export function atLeast(current: BreakpointOrBase, bp: Breakpoint): boolean {
  return current !== "base" && BREAKPOINTS[current] >= BREAKPOINTS[bp];
}

/** Splits a Responsive value into [breakpoint, value] pairs; a plain value becomes base. */
export function responsiveEntries<T>(value: Responsive<T> | undefined): [BreakpointOrBase, T][] {
  if (value === undefined) return [];
  if (typeof value !== "object" || value === null) return [["base", value as T]];
  return (["base", ...ORDER] as BreakpointOrBase[]).flatMap((k) => {
    const v = (value as Partial<Record<BreakpointOrBase, T>>)[k];
    return v === undefined ? [] : [[k, v] as [BreakpointOrBase, T]];
  });
}

function subscribe(onChange: () => void): () => void {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const lists = ORDER.map((bp) => window.matchMedia(`(min-width: ${BREAKPOINTS[bp]}px)`));
  for (const l of lists) l.addEventListener("change", onChange);
  return () => {
    for (const l of lists) l.removeEventListener("change", onChange);
  };
}

function snapshot(): BreakpointOrBase {
  return typeof window === "undefined" ? "base" : breakpointFor(window.innerWidth);
}

/**
 * Current viewport breakpoint, updated on resize. Renders "base" on the server and the first
 * client pass, so prefer CSS (Grid columns, Tailwind `md:`) for layout and use this only for
 * behaviour that CSS cannot express (for example, a Drawer instead of a side panel).
 */
export function useBreakpoint(): BreakpointOrBase {
  return useSyncExternalStore(subscribe, snapshot, () => "base");
}
