# BulkBar

Bar that appears while rows are selected, with the selection count, the actions that apply to the selection and a button to clear it. It sticks to the bottom of its scrolling container so the actions stay in reach on long lists.

## Anatomy
`div.x-bulk-bar[role=region][aria-label]` > `span.x-bulk-count[aria-live=polite]` + `div.x-bulk-actions` (children) + secondary `Button.x-bulk-clear`.

## Rules
- Render it next to the `DataTable` it acts on, inside the same scrolling container; pass `count={selected.size}` and an `onClear` that empties the selection. It renders nothing at 0.
- Actions are secondary `Button`s with verbs ("Suspend", "Delete"), at most four. A destructive action opens a `Dialog` that names how many items it changes.
- After an action completes, clear the selection and confirm with a `Toast`.
- Use it instead of a `Toolbar` with `variant="bulk"` when the actions should only show while something is selected; do not use both for one table.
- The count is read out politely when it changes; the region is named by `labels.region`.
- `labels` (`BulkBarLabels`: `region`, `selected(count)`, `clear`) overrides the English defaults.

## Responsive
- The actions wrap onto the next line on a narrow screen; the count and Clear stay first.
