# TreeView

File tree over a flat list of visible rows, with git status marks and full keyboard support.

## Anatomy
`div.ws-tree[role=tree]` > `button.ws-tree-row[role=treeitem]` > `.ws-tree-icon` (folder or file), `.ws-tree-name`, optional `.ws-tree-dot`, optional `.ws-tree-mark[data-kind]`.

## Rules
- Pass only visible rows, children right after their dir. The caller owns open state; `onToggle` flips it.
- Indent comes from `depth` (14px a level); never nest trees.
- Keys: Up/Down move, Right opens a dir or enters it, Left closes a dir or climbs to the parent, Home/End jump, Enter toggles or opens.
- One row is tabbable at a time (roving tabindex); `selected` marks the open file with a tint, not a stripe.
- Status letters: A added (`--ok`), M modified (`--warn`), D deleted (`--danger`), R renamed (`--violet`). The letter is aria-hidden; `labels.marks` is read out.
- A dir with changed files inside shows the dot; `labels.changed` reads it out.
- `TreeViewLabels`: `tree`, `changed`, `marks.{added,modified,deleted,renamed}`.

## pathRows
`pathRows(files, closed)` builds the visible rows from a flat `{ path, mark? }[]`: folders first, each level sorted by name, folder id `path/`, `changed` on folders that hold a marked file. `closed` is the set of folder ids whose children are hidden; the caller owns it and `onToggle` edits it.
