# Banner

Full-width warning inside a view, for a condition that persists until the user acts.

## Rules
- Warn tint (`--x-color-warn-soft`) with a 1px `--x-color-warn-line` border and the warn icon, by default. No left stripe.
- `tone`: `info` (accent tint, info icon), `ok` (ok tint, check icon), `warn` (default), `danger` (danger tint, alert icon, `role="alert"`; the others are `role="status"`). The border is the tone colour at 35%.
- Title in `strong` says the condition; the optional second line says the consequence.
- At most one action, as a secondary `Button`.
- Transient confirmations are a `Toast`, not a banner.
