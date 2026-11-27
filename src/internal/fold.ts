/** Length and curve of the AppShell fold, the same 0.18s as the drawer. */
export const FOLD_MS = 180;
export const FOLD_EASE = "cubic-bezier(0.2, 0.8, 0.2, 1)";

/**
 * Animates the sidebar folding into a rail (or back) after the grid has already snapped to its new columns: FLIP, so
 * nothing is laid out per frame. The column slides the width difference back with `transform`; the sidebar's edge
 * follows it, with `clip-path` while unfolding and a ghost panel (`::after`, scaled) while folding, so no gap opens
 * between them. `from` is the sidebar's width before the change. Returns a cancel function, or nothing when there is
 * nothing to animate: no change in width (the drawer), reduced motion, or no Web Animations.
 */
export function foldMotion(shell: HTMLElement, side: HTMLElement, col: HTMLElement, from: number): (() => void) | undefined {
  const delta = Math.round(from - side.getBoundingClientRect().width);
  if (!delta || typeof col.animate !== "function") return undefined;
  if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;
  shell.dataset.folding = delta > 0 ? "in" : "out";
  shell.style.setProperty("--x-shell-fold", `${Math.abs(delta)}px`);
  const timing: KeyframeAnimationOptions = { duration: FOLD_MS, easing: FOLD_EASE };
  const runs = [
    col.animate([{ transform: `translateX(${delta}px)` }, { transform: "none" }], timing),
    delta > 0
      ? side.animate([{ transform: "scaleX(1)" }, { transform: "scaleX(0)" }], { ...timing, pseudoElement: "::after" })
      : side.animate([{ clipPath: `inset(0 ${-delta}px 0 0)` }, { clipPath: "inset(0)" }], timing),
  ];
  const done = (): void => {
    delete shell.dataset.folding;
    shell.style.removeProperty("--x-shell-fold");
  };
  runs[0]!.addEventListener("finish", done);
  return () => {
    for (const run of runs) run.cancel();
    done();
  };
}
