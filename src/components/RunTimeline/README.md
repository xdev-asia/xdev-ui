Vertical list of the steps of one run (an automation run, a session job): a status dot on a thin line, the step label, its start time and how long it took.

## Rules
- Use it in a detail panel to show what a run did and where it stopped. A table of many runs is a `DataTable`; one step's output is a `CodeBlock`.
- `steps` run oldest first. `status` is `pending`, `running`, `done`, `failed` or `skipped`. The dot never carries the state alone: a screen-reader-only word follows each label, and the running step has `aria-current="step"`.
- `at` is text, already formatted. `durationMs` goes through `labels.duration`, so the unit words are yours.
- `labels` translates `list` (the name of the list), `status` (one word per state) and `duration`. The component has no other strings.
- State is a dot and, for a failed step, the label in the danger colour. No coloured stripe.
- Steps wrap at 360px; time and duration stay on the right.
