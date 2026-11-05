# Layout at 360px and keyboard access

- Design for 360px first. No horizontal scroll on the page; a table scrolls inside its own wrapper.
- Widths in `%`, `ch`, `rem` or tokens; spacing from `--x-space-1` to `--x-space-8`; no raw px except 1px hairlines.
- Rows of controls use `display: flex; flex-wrap: wrap; gap: var(--x-space-3)`.
- Every control is reachable with Tab in reading order; the focus ring is the cyan `--x-color-signal` outline, never removed.
- Icon-only buttons need `aria-label`; inputs need a visible label or `aria-label`.
- Colour is never the only signal: pair a `StatusDot` tone with its label.
- Honour reduced motion; the library already does for its own animation.
- Verify with the `xdev-ui-review` checklist before you report the work as done.
