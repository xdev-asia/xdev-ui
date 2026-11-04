# Spinner

Small ring that shows work in progress of unknown length, with a label only screen readers hear.

## Anatomy
`span.x-spinner[role=status][data-size]` > `span.x-spinner-ring` (aria-hidden) + `span.x-sr-only`.

## Rules
- For waits under a few seconds with no known progress. Known progress uses `Meter`; an agent at work uses `StatusDot`.
- `sm` (10px) sits inline next to text or in a button; `md` (16px) for a pane that is loading.
- Always say what loads with `label` ("Loading usage"); the default `labels.loading` is generic.
- The ring rotates with transform; under `prefers-reduced-motion` it pulses opacity instead.
- Do not show more than one spinner per region.
