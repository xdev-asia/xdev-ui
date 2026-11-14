# EmptyState

Message for a list, pane or view with nothing in it yet, with a hint and an optional way to fill it.

## Anatomy
`div.x-empty[data-size]` > optional `.x-empty-icon` (center only) + `p.x-empty-title` + `p.x-empty-hint` + optional `StepDots` and `ol.x-empty-steps` + `.x-empty-actions`.

## Rules
- `inline` inside a pane or list: one muted line, no icon. `center` for a whole view.
- Title states what is missing ("No worktrees yet"), not an error. Errors use `Banner`.
- Hint says how to fill it in one line; actions offer that step (one primary at most).
- No illustrations or emoji; the icon tile uses `--x-color-signal-soft`.
- `steps` (`{label, done?}[]`) adds `StepDots` and a numbered list under the hint, for a first-run view that teaches a short path (three steps at most). `current` is 1-based and defaults to the first step not done; that step has `aria-current="step"`. A finished step shows a check mark and a hidden "Done" text, so state is never colour alone. The actions still carry the one primary for the current step.
- `labels` (`done`, `step`, `steps`) translate the step texts; they matter only with `steps`.
- For "no search results", name the query in the title and offer to clear it.

## Responsive
- The actions wrap; centred empty states keep them centred.
