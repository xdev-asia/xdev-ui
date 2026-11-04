# ActionTile

Button tile with an icon, a short title and a one-line description; one click opens a dialog or starts an action.

## Anatomy
`button.x-action-tile` > `.x-action-tile-icon` + `.x-action-tile-title` + `.x-action-tile-desc`. Put tiles in `.x-action-tiles` (responsive grid, one column at 360px).

## Rules
- Use it for a short list of starting points (how-to cards, templates), not for navigation rows (`ListRow`) or primary actions (`Button`).
- Hover and focus are a tint and a 1px accent border, never a coloured stripe.
- Title is a sentence-case label without a full stop; the description is one line.
- The tile is a native button: Enter and Space work, `disabled` removes it from the tab order.
