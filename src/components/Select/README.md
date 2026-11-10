# Select

Native `<select>` styled as `.lang-select`, for choosing one of many options such as the UI language.

## Rules
- Always native: the OS list handles keyboard and screen readers.
- Give it an `aria-label` or wrap it in a visible label.
- Two to four short options that benefit from being seen together: use `Segmented`.
- `ref` is a plain prop (React 19) typed `Ref<HTMLSelectElement>`.
- `icon` puts a decorative leading icon inside the control (`globe` for a language picker); the select keeps its label. With an icon it renders in `span.x-select-wrap` > `svg.x-select-icon` + `select[data-icon]`, and `className` still goes on the `select`.
