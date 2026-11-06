# StepDots

A row of small dots that shows where a short sequence stands, such as the steps of a tour or a wizard.

## Anatomy
`span.x-step-dots[role=img]` > one `span.x-step-dot` per step; the current one has `data-current`, the passed ones `data-done`.

## Rules
- For 2 to 7 steps. A longer sequence shows text ("12 of 40") or a `Meter`.
- `current` is 1-based and clamped to the range.
- The dots are one image: `labels.step(current, total)` names it ("Step 2 of 3"); pass the translated text from the app. The dots themselves are not focusable or clickable.
- The current dot is `--x-color-accent`; passed and coming dots are `--x-color-line`. No other colour.
- Pair it with Back and Next buttons; the dots do not move the step.
