# WorktreeRow

Row of the side list: one worktree with its branch, the agents running in it, the diff size and one status dot.

## Anatomy
A `ListRow` (`.x-worktree-row`): status dot with screen reader text, branch (`.x-worktree-branch`, monospace) and repo, then `.x-worktree-agents` (`AgentChip`s) and a `DiffStat`.

## Props
`branch`, `repo?`, `agents: AgentChipProps[]`, `status: SessionState`, `diff?: { add, del }`, `selected?`, `onSelect`, `as?` ("div" or "li"), `labels?` (`status` per state, `diffStat(added, removed)`).

## Rules
- One status per row, taken from the same selector as the tab dots and the attention inbox. The dot always has text for screen readers.
- The selected row has `aria-current="true"` and a tint with a 1px accent border; never a coloured stripe.
- Only the branch and status are inside the button; chips and the diff stat are read as separate images and text.
- Put rows in a `ul` and pass `as="li"`.
- Translate the status words and the diff summary with `labels`; the defaults are English.
