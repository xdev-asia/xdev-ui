# Banner

Full-width warning inside a view, for a condition that persists until the user acts.

## Rules
- Warn tint (`--x-color-warn-soft`) with a 1px `--x-color-warn-line` border and the warn icon. No left stripe.
- Title in `strong` says the condition; the optional second line says the consequence.
- At most one action, as a secondary `Button`.
- Transient confirmations are a `Toast`, not a banner.
