# Select

Native `<select>` styled as `.lang-select`, for choosing one of many options such as the UI language.

## Rules
- Always native: the OS list handles keyboard and screen readers.
- Give it an `aria-label` or wrap it in a visible label.
- `label` (with optional `hint`, `error`, `hideLabel`) renders it like a `Field`: a `.ws-field.x-select-field` column with the label above, the select full width, and the note under it linked by `aria-describedby`. `className` then goes on the wrapper.
- Two to four short options that benefit from being seen together: use `Segmented`.
- `ref` is a plain prop (React 19) typed `Ref<HTMLSelectElement>`.
- `icon` puts a decorative leading icon inside the control (`globe` for a language picker); the select keeps its label. With an icon it renders in `span.x-select-wrap` > `svg.x-select-icon` + `select[data-icon]`, and `className` still goes on the `select`.
- Give it `options` (a flat `{ value, label }[]`) or native `<option>` / `<optgroup>` children (grouped or computed lists), never both: when both are set `options` wins and the children are dropped.
- `size="sm"` is the compact select for toolbars and table filters, 26px high to line up with `SearchInput size="sm"`; it sets `data-size="sm"` on the `select` (and on `.x-select-wrap` with an icon). Forms keep the default `"md"`. The native `size` attribute (visible rows) is not available: a list box is a different control.
