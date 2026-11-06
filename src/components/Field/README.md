# Field

Labelled text input with an optional hint or error line.

## Anatomy
`div.ws-field` > `label[for]`, `input`, `small` (hint or error). The hint and error sit outside the `label`, so a screen reader reads them once, through `aria-describedby`, not as part of the label. The wrapper takes `data-invalid` on error; `className` goes on the wrapper.

## Rules
- Label above the input, sentence case, no trailing colon.
- Hint: one short line saying what the value becomes. Error: what to do, not what went wrong ("Pick a port above 1024.").
- On error the input gets `aria-invalid` and the `small` is linked by `aria-describedby`.
- Placeholder shows an example value, never the label.
- For the single input inside a `Dialog` use the bare `.dialog-input` class.
- `ref` is a plain prop (React 19) typed `Ref<HTMLInputElement>`; it reaches the `input`.
