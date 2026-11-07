# AttentionInbox

Header button with a count and a popover list of everything that waits for the user: approvals, questions and failed runs, longest wait first.

## Anatomy
`span.x-popover-anchor` > `button.x-attention-btn` (bell + `.x-attention-count`) + `div.x-popover.x-attention-pop[role=dialog]` > `ul.x-attention-list` > `li.x-attention-row` (`AgentChip`, worktree, ask text, kind, wait time, "Open" button). A visually hidden `role="status"` next to the button announces count changes.

## Props
| prop | meaning |
|---|---|
| `items` | `{ id, agent, worktree, text, since, kind }[]`; `kind` is `approval`, `question` or `failed`; `since` is epoch ms, a Date or an ISO string |
| `onOpen(id)` | called when a row's button is pressed |
| `open`, `onOpenChange` | controlled open state; uncontrolled when `open` is undefined |
| `now` | epoch ms for wait times (default `Date.now()`); pass it in tests and stories |
| `labels` | `title`, `button(count)`, `empty`, `open`, `openItem(item)`, `kind`, `waited(ms)` |

## Rules
- One inbox per window, in the header. Feed it from the same selector as tab dots, side rows and the footer count.
- Rows are sorted oldest first so the longest wait is on top; the component sorts, the caller need not.
- Kind is always text next to the row, never colour alone. The count badge is a number, hidden at 0 and capped at "99+".
- Built on `Popover`: Escape and click outside close it, focus returns to the button.
- Every string is in `labels`; the defaults are English. Translate `waited` too.
