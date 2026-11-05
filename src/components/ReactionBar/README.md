A row of reaction toggle buttons for a comment: a symbol and a count each.

## Rules
- Each item needs `key`, `label`, `symbol`, `count` and `mine`. `label` is the accessible name and title; the symbol is an `Icon` or short text, never the only name.
- `mine` is rendered as `aria-pressed`; the pressed button gets a tint and a 1px border, not a coloured stripe.
- A count shows only above zero.
- `onToggle(key)` fires for each click; the caller decides whether that adds or removes the reaction. Apply it at once and roll back on failure.
- `disabled` disables every button, for example while the comments are loading.
- Pass translated `label` text. Do not use emoji as labels.
