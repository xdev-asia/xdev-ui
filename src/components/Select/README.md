# Select

Native `<select>` styled as `.lang-select`, for choosing one of many options such as the UI language.

## Rules
- Always native: the OS list handles keyboard and screen readers.
- Give it an `aria-label` or wrap it in a visible label.
- Two to four short options that benefit from being seen together: use `Segmented`.
- `ref` is a plain prop (React 19) typed `Ref<HTMLSelectElement>`.
