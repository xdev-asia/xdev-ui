# BoardColumn

One vertical column of a `Board`: a head with title, count and actions, then a scrolling list of cards.

## Anatomy
`section.x-board-col` > `header.x-board-col-head` (`h3.x-board-col-title`, count `Badge`, `.x-board-col-actions`) + `div.x-board-col-body[role=list]`.

## Rules
- `onAdd` shows a small plus `IconButton` named by `labels.add` ("Add card" by default) after `actions`. Use it for a lane that takes new cards, such as a squad lane; leave it out for a lane that only fills by moving cards.
- Width is 240 to 320px.
- `dropTarget` shows a 1px accent border and a light tint (`.x-board-col[data-drop-target]`) while a card is dragged over it; clear it when the drag ends.
- At most one primary action per column head, as a `Button` or `IconButton` in `actions`; more go in a `Menu`.
- The body is `role="list"` named by `aria-label`, which defaults to the title; children are `BoardCard`s.
- State is a tint, a 1px border or a dot, never a coloured left stripe.
- The root takes a `ref` and the rest of the `section` attributes (`data-*`, drag events such as `onDragOver` and `onDrop`); `className` is merged.
