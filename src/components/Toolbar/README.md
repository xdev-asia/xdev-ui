# Toolbar

Head of a pane with its title, a count and a group of actions, or the bar shown while rows are selected.

## Anatomy
`div.pane-head[data-variant]` > `span.pane-title` (+ `span.pane-count`) + `div.pane-tools[role=toolbar]`.

## Rules
- `head`: 11px uppercase muted title; the count stays in normal case. Use it at the top of every side pane.
- `bulk`: a 10% `--accent` tint bar that replaces the head while rows are selected; title is the summary ("3 selected").
- Actions are IconButtons (with labels) or small Buttons, at most four; put the rest in a `Menu` behind "More".
- The actions group has `role="toolbar"`, is named by `label`, a string `title`, or `labels.actions`, and Left/Right move focus inside it.
- Each action stays in the Tab order too; the group does not manage tabindex.
