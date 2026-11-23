# Card

Flat bordered surface that groups one topic, with an optional head of title, subtitle and actions.

## Anatomy
`section.x-card` > optional `.x-card-head` (`.x-card-heading` > `h3.x-card-title` or `.x-card-title-row` (title + `titleAside`), `p.x-card-sub`; `.x-card-actions`) + `.x-card-body`.

## Props
- Every `section` attribute except `title` (`id`, `role`, `aria-*`, `data-*`, `onClick`) goes on the `section`; `className` is added to `x-card`.
- With a `title` the section is named by it (`aria-labelledby` points at the heading, over one you pass). Without a `title` a passed `aria-labelledby` stays.
- `bodyClassName` is added to `.x-card-body`, e.g. a grid or gap utility for the content.
- The head renders only when there is a `title`, `subtitle` or `actions`. With none of them the card is the body alone.

## Rules
- Flat: `--x-color-surface`, a 1px `--x-color-line` border, `--x-radius-lg`. No shadow at rest and no coloured stripe.
- One topic per card. Do not nest cards; use a `Disclosure` or plain rows inside.
- `monoSubtitle` for paths, file names and branches.
- `flush` for content that draws its own rows, like a diff or a `ListRow` list.
- Actions are secondary buttons or IconButtons; at most two.
- `titleAside` is one control that acts on the whole card (a mode or filter select), set right after the title and kept out of the heading so the card's name stays the title alone.
- `headingLevel` (2 to 6, default 3) sets the title's heading element so the card fits the page outline; the look does not change.

## Responsive
- The head wraps: actions move under the title when the card is narrow.
- Below 768px the subtitle wraps instead of being cut with an ellipsis; from 768px up it stays on one line.
