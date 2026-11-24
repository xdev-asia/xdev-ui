# Motion recipes

Each recipe is a before and after. Most come from fixes made in `@xdev-asia/ui` itself.

## Contents
- Move with transform, not position
- Promote a layer only during a gesture
- Full-height surfaces on phones
- FLIP for a layout change
- Scroll-linked without scroll events
- Pause a loop off screen
- Entrance and exit
- Paint and blur

## Move with transform, not position

The `Switch` thumb used to transition `left`, which runs layout every frame. It now moves with `transform`:

```css
/* before */
.app-thumb { left: 0.125rem; transition: left 0.12s; }
.app-toggle:checked .app-thumb { left: 1rem; }

/* after */
.app-thumb { left: 0.125rem; transition: transform 0.12s ease-out; }
.app-toggle:checked .app-thumb { transform: translateX(0.875rem); }
@media (prefers-reduced-motion: reduce) { .app-thumb { transition: none; } }
```

The same goes for a panel that opens by `width` or `height`: keep its size and slide it with `translate`, or fade it with `opacity`. A disclosure that must change height is not animated in xDev; it opens at once.

## Promote a layer only during a gesture

`will-change: transform` on a resting element keeps a layer for good. The browser rasterises it at one scale, so after a zoom the text blurs, and many such layers cost memory. `PanZoom` sets `data-panning` on pointer down and removes it on pointer up:

```css
/* before */
.app-canvas-content { will-change: transform; }

/* after */
.app-canvas[data-panning] .app-canvas-content { will-change: transform; }
```

```tsx
const onPointerDown = (e: PointerEvent<HTMLDivElement>) => e.currentTarget.setAttribute("data-panning", "");
const onPointerUp = (e: PointerEvent<HTMLDivElement>) => e.currentTarget.removeAttribute("data-panning");
```

## Full-height surfaces on phones

`100vh` is the height with the address bar hidden, so the bottom of a `100vh` page sits under the bar while it shows. Keep `vh` as the fallback and put `dvh` after it (audit `viewport-height`). With Tailwind v4 use `h-dvh` or `min-h-dvh`, never `h-screen`.

```css
.app-signin { min-height: 100vh; min-height: 100dvh; }
```

`AppShell`, `SiteShell` and `AuthShell` already do this.

## FLIP for a layout change

When an item must change place (a reordered card, a row that moves to another group), measure once, change the layout, then animate the difference with `transform`:

```ts
function flip(el: HTMLElement, change: () => void): void {
  const first = el.getBoundingClientRect();
  change();
  const last = el.getBoundingClientRect();
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  el.animate(
    [{ transform: `translate(${first.left - last.left}px, ${first.top - last.top}px)` }, { transform: "none" }],
    { duration: 160, easing: "ease-out" },
  );
}
```

Batch every read before every write when several items move.

## Scroll-linked without scroll events

`AppShell` draws the rule under its top bar only once the page scrolls, with a scroll timeline and no JavaScript:

```css
.app-main { scroll-timeline: --app-scroll block; }
.app-top { animation: app-top-rule linear both; animation-timeline: --app-scroll; animation-range: 0 var(--x-space-6); }
@keyframes app-top-rule { to { border-bottom-color: var(--line); } }
```

For "has this entered the screen", use `IntersectionObserver`, never a `scroll` listener that reads `scrollY`.

## Pause a loop off screen

A loop means "working". Stop it when the work ends, and pause it when it is not visible:

```ts
const io = new IntersectionObserver(([e]) => el.toggleAttribute("data-paused", !e.isIntersecting));
io.observe(el);
```

```css
.app-loop[data-paused] { animation-play-state: paused; }
```

## Entrance and exit

Enter with `opacity` and a short `translate` (4 to 24px) and `ease-out`; leave at once, or with a shorter fade. Never animate an element out while focus or a screen reader is still on it.

```css
.app-sheet { animation: app-sheet-in 180ms ease-out; }
@keyframes app-sheet-in { from { opacity: 0; transform: translateY(1.5rem); } }
@media (prefers-reduced-motion: reduce) { .app-sheet { animation: none; } }
```

## Paint and blur

- A hover tint on a row is fine; a transition of `background` on a whole page or a large card grid is not.
- The `Dialog` backdrop has a static 2px blur. Do not animate it, and do not add blur to a sticky header that sits over scrolling content.
- `box-shadow` is not animated; elevation in xDev is fixed per layer (`--shadow-menu`, `--shadow-dialog`).
