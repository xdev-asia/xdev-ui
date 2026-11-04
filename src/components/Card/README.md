# Card

Flat bordered surface that groups one topic, with an optional head of title, subtitle and actions.

## Anatomy
`section.x-card` > optional `.x-card-head` (`.x-card-heading` > `h3.x-card-title`, `p.x-card-sub`; `.x-card-actions`) + `.x-card-body`.

## Rules
- Flat: `--x-color-surface`, a 1px `--x-color-line` border, `--x-radius-lg`. No shadow at rest and no coloured stripe.
- One topic per card. Do not nest cards; use a `Disclosure` or plain rows inside.
- `monoSubtitle` for paths, file names and branches.
- `flush` for content that draws its own rows, like a diff or a `ListRow` list.
- Actions are secondary buttons or IconButtons; at most two.
