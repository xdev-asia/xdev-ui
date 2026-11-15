/**
 * Edge fade for a row that scrolls sideways (Segmented, Tabs): `data-scroll-fade` names the side or sides that
 * hide more content, and the CSS masks that edge. Pure of React: pass `scrollFadeRef` as the row's callback ref.
 */

export type ScrollFade = "start" | "end" | "both";

interface Metrics {
  scrollLeft: number;
  scrollWidth: number;
  clientWidth: number;
  overflowX: string;
}

/** Which sides hide content. Right-to-left rows report a negative scrollLeft, so the distance is its absolute value. */
export function scrollFade({ scrollLeft, scrollWidth, clientWidth, overflowX }: Metrics): ScrollFade | undefined {
  if (overflowX !== "auto" && overflowX !== "scroll") return undefined;
  const max = scrollWidth - clientWidth;
  if (max <= 1) return undefined;
  const pos = Math.abs(scrollLeft);
  const start = pos > 1;
  const end = pos < max - 1;
  return start && end ? "both" : start ? "start" : end ? "end" : undefined;
}

/** Callback ref (React 19 cleanup): keeps `data-scroll-fade` current on scroll and resize. */
export function scrollFadeRef(el: HTMLElement | null): (() => void) | undefined {
  if (!el) return undefined;
  const update = (): void => {
    const fade = scrollFade({ scrollLeft: el.scrollLeft, scrollWidth: el.scrollWidth, clientWidth: el.clientWidth, overflowX: getComputedStyle(el).overflowX });
    if (fade) el.dataset.scrollFade = fade;
    else delete el.dataset.scrollFade;
  };
  update();
  el.addEventListener("scroll", update, { passive: true });
  if (typeof ResizeObserver === "function") {
    // The row and its items: an item growing (a new badge, a translated label) changes the overflow too.
    const ro = new ResizeObserver(update);
    ro.observe(el);
    for (const child of Array.from(el.children)) ro.observe(child);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }
  window.addEventListener("resize", update);
  return () => {
    el.removeEventListener("scroll", update);
    window.removeEventListener("resize", update);
  };
}
