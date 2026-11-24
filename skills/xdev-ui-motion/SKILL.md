---
name: xdev-ui-motion
description: "Adds, reviews and fixes motion on screens and components built with @xdev-asia/ui: which library parts already animate, the xDev motion budget (transform and opacity, 120 to 200ms, ease-out entrances, reduced motion), and rendering performance rules for layout thrashing, will-change, scroll-linked motion, paint, blur and view transitions, with the audit rules layout-motion, will-change and reduced-motion. Use when adding or changing a transition or animation, when a drawer, popover, pan or zoom view stutters or blurs, or when reviewing CSS or JS animation in an @xdev-asia/ui app or in the library."
license: Apache-2.0
---

# Motion and rendering performance with @xdev-asia/ui

xDev is a quiet tool: motion confirms where a thing came from and nothing else. Most screens need no new motion at all, because the parts already animate. This skill decides when motion is allowed and how to make it cheap. The look is in `xdev-ui-design` (rules `mot-*`), the audit in `xdev-ui-review`.

## When to use

- Adding or changing a `transition`, `@keyframes`, Web Animations or `requestAnimationFrame` code.
- An interaction stutters, a panel jumps, a zoomed view blurs, scrolling janks.
- Reviewing motion in an app on `@xdev-asia/ui`, or in a library part.

Skip it for colour, layout or copy changes with no motion, and for charts that do not animate.

## How to use

- **Apply**: follow the rules below for every motion you add in this task.
- **Review a file**: for each violation report the exact line, why it matters (one sentence) and a code-level fix. Keep fixes small; do not migrate or mix animation libraries.

## 1. Use what the library already moves

| part | motion | length |
|---|---|---|
| `Popover`, `MenuButton`, `Coachmark` | fade and 4px rise on open | 120ms ease-out |
| `Tooltip` | fade; hidden after the fade | 150ms |
| `Toast` | fade and 6px rise | 160ms ease-out |
| `Drawer` | slide 24px from its side, fade | 180ms ease-out |
| `AppShell` off-canvas nav | slide | 180ms ease |
| `Switch` thumb | `transform` | 120ms ease-out |
| `StatusDot` `pulse`, `Spinner`, `Skeleton` | loops for "working" only | 0.8 to 1.4s |

Under `prefers-reduced-motion: reduce` every one of them stops, except `Spinner`, which pulses instead of turning. Do not add a second entrance on top of a part that already has one, and do not animate a library part from the app.

## 2. The budget

- Animate only `transform` and `opacity`. Colour or border transitions are allowed on small parts (a row, a chip), never on a page or panel.
- Interaction feedback finishes within 200ms; entrances 120 to 200ms with `ease-out`; exits can be instant. Do not invent easing curves; the library uses `ease` and `ease-out`.
- No motion that carries meaning on its own, no bounce, no parallax, no decoration that loops. A loop means "working" and stops when the work stops (`mot-pulse-working-only`).
- Guard every move, scale or spin:

```css
.app-panel { transition: transform 0.18s ease-out; }
@media (prefers-reduced-motion: reduce) {
  .app-panel { transition: none; }
}
```

## 3. Performance rules by priority

| # | category | must | never |
|---|---|---|---|
| 1 | never patterns | read layout once, then write | interleave reads and writes in a frame; animate from `scroll` events; a `requestAnimationFrame` loop with no stop |
| 2 | mechanism | `transform` / `opacity`; CSS for state changes, JS only when a gesture drives it | `transition: all`; a `width`, `height`, `top`, `left`, `margin` or `padding` transition (audit `layout-motion`) |
| 3 | measurement | measure once, animate the difference with `transform` (FLIP) | `getBoundingClientRect` inside the frame loop |
| 4 | scroll | scroll-driven animation (`animation-timeline`) or `IntersectionObserver` | polling `scrollY` to set styles |
| 5 | paint | paint animation only on small, isolated elements | animating a background, gradient or shadow on a large surface; animating an inherited CSS variable |
| 6 | layers | `will-change` only while the motion runs (audit `will-change`) | a resting `will-change`, many large promoted layers |
| 7 | blur | static blur at most 2px (the `Dialog` backdrop) | animating `filter: blur()` or `backdrop-filter` |
| 8 | view transitions | page-level navigation only | view transitions on interaction-heavy UI or anything that can be interrupted |

Worked fixes for each row, taken from the library itself: [recipes](references/recipes.md).

## 4. Pan, zoom and drag

Use `PanZoom` (and `ZoomBar`) instead of a custom viewport. It moves its content with one `transform`, promotes the layer only while a drag runs (`data-panning`), and re-rasterises after a zoom, so text stays sharp. For drag to reorder use `SortableList` or `DataTable` reorder; both keep a keyboard path.

## 5. Check

```bash
node <review-skill-dir>/scripts/audit.mjs src
```

| rule | finds |
|---|---|
| `layout-motion` | a transition of `all` or of a size, position or spacing property; keyframes that change one |
| `will-change` | `will-change` on a selector with no state |
| `reduced-motion` | moving keyframes in a file with no `prefers-reduced-motion` guard |

Then by hand: turn on reduced motion in the OS and repeat the interaction; record a performance trace of the slow interaction and look for layout or paint in every frame; zoom `PanZoom` to 200% and check that text is sharp.

## Report

List each finding with file and line, the rule, and the fix you made. Say which manual checks you did not run.
