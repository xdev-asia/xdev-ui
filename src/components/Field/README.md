# Field

Labelled text input with an optional hint or error line.

## Anatomy
`div.ws-field` > `label.x-label[for]`, `input`, `small` (hint or error). With `action` the label sits in `div.x-field-label-row` next to `span.x-field-action`. With `end` or a password toggle the input sits in `div.x-field-control` > `input` + `span.x-field-end`; the wrapper then draws the box and the focus ring, so the text stops before the end content. The hint and error sit outside the `label`, so a screen reader reads them once, through `aria-describedby`, not as part of the label. The wrapper takes `data-invalid` on error; `className` goes on the wrapper.

## Rules
- `required` on the input also draws an asterisk after the label (`aria-hidden`; the control's own `required` is what assistive tech reads).
- Label above the input, sentence case, no trailing colon.
- Hint: one short line saying what the value becomes. Error: what to do, not what went wrong ("Pick a port above 1024.").
- On error the input gets `aria-invalid` and the `small` is linked by `aria-describedby`.
- Placeholder shows an example value, never the label.
- For the single input inside a `Dialog` use the bare `.dialog-input` class.
- `ref` is a plain prop (React 19) typed `Ref<HTMLInputElement>`; it reaches the `input`.
- `hideLabel` keeps the label in the DOM for screen readers and hides it visually (`.x-sr-only`); use it where the surrounding UI already names the input, instead of a bare `aria-label`.
- `mono` sets the value in the mono face (ids, codes, IPA, paths, keys), as `Textarea mono` does; the label and hint stay in the body face.
- `action` puts a small control on the label row, end-aligned: a `Button variant="link"` such as "Generate". It is outside the label, so it keeps its own name.
- `end` puts content inside the control at its end: a unit ("ms"), a small `IconButton size="sm"`. A unit in `end` is visual only; say it in the label or hint as well ("Timeout, in ms").
- `type="password"` adds a show/hide toggle at the control end: an `IconButton` (`eye`, then `eye-off`) with `aria-pressed`, named by `labels.show` / `labels.hide` ("Show password" / "Hide password"), that switches the input between `password` and `text`. It is disabled with the input. `reveal={false}` opts out. With `end` as well, both render, the toggle last.
- Built-in words come from `labels` with English defaults; pass `vi` strings from the app.
- `Label` renders the same `label.x-label` for a custom control that is not a `Field`.
