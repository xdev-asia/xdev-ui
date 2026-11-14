# Board

Horizontal scroller of `BoardColumn`s, such as the task board with its Backlog to Done columns.

## Anatomy
`div.x-board[role=group]` > `section.x-board-col` (`header.x-board-col-head`, `div.x-board-col-body[role=list]` > `div.x-board-card[role=listitem]`). See `BoardColumn` and `BoardCard`.

## Rules
- Scrolls sideways inside itself (`overflow-x: auto`); the page never scrolls sideways. Give it a parent with a height.
- Gap between columns is `--x-space-3`.
- Name it with `aria-label` ("Tasks").
- State is shown as a tint, a 1px border or a `StatusDot`. Never a coloured left stripe on a column or card.

## Example: five columns
```tsx
<Board aria-label="Tasks">
  {["Backlog", "To do", "In progress", "In review", "Done"].map((name) => (
    <BoardColumn key={name} title={name} count={tasks[name].length}>
      {tasks[name].map((t) => (
        <BoardCard key={t.id} title={t.title} meta={t.agent} status={t.status} onOpen={() => open(t.id)} />
      ))}
    </BoardColumn>
  ))}
</Board>
```

## CSS classes
`.x-board`, `.x-board-col`, `.x-board-col-head`, `.x-board-col-title`, `.x-board-col-actions`, `.x-board-col-body`, `.x-board-card`, `.x-board-card-head`, `.x-board-card-title`, `.x-board-card-menu`, `.x-board-card-meta`, `.x-board-card-tags`. Modifiers are data attributes: `.x-board-col[data-drop-target]`, `.x-board-card[data-selected]`, `.x-board-card[data-dragging]`.

## Responsive
- The board scrolls sideways inside itself; its hidden live text stays inside the scroller, so it does not widen the page.
