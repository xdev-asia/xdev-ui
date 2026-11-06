# BoardCard

One item in a `BoardColumn`: title, optional status dot, meta line and tags.

## Anatomy
`div.x-board-card[role=listitem]` > `.x-board-card-head` (`StatusDot`, `.x-board-card-title`, `.x-board-card-actions`, `.x-board-card-menu`) + optional `.x-board-card-meta` + `.x-board-card-tags`.

## Rules
- Focusable; click and Enter call `onOpen`. Keys and clicks inside `menu` do not.
- `actions` is a slot for inline controls right after the title; like `menu`, its clicks and keys do not reach `onOpen`.
- The root takes a `ref` and the rest of the `div` attributes (`data-*`, `onKeyDown`, `onPointerDown`, `draggable`, drag events); `className` is merged and the caller's `onClick` and `onKeyDown` run before `onOpen`.
- `status` ("idle", "running", "waiting", "error") draws a `StatusDot` before the title and a visually hidden text; override the words with `labels.status`.
- `selected` is a tint with a 1px accent border (`aria-current`); `dragging` lowers opacity and adds `--shadow-menu`.
- Tags are `Tag`s, kept to one short row.
- Never a coloured left stripe.
