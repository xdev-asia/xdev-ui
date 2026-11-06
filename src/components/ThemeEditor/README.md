# ThemeEditor

The fields of a colour theme: name, mode, colour groups, a live preview and the list of contrast issues. Generic and text-free: the app supplies the groups, labels and issues.

## Anatomy
`div.x-theme-editor` > name field + `children` + mode `Segmented` + `fieldset.x-theme-editor-group` per group (`legend` + `ColorField`s) + `ThemePreview` + `section.x-theme-editor-issues` (`h5`, `.x-theme-editor-count[role=status]`, `ul.x-theme-editor-issue-list[role=list]`).

## Rules
- Controlled: `mode`, `name`, `colors` (key to `#rrggbb` in force for `mode`) and `overridden` (keys the theme sets) come from the caller; edits go out through `onMode`, `onName`, `onColor`, `onReset`.
- `groups` give each fieldset a `title` and its `keys` with a visible `label`. Colour fields are keyed by mode, so a switch resets their text.
- `labels.reset` and `labels.picker` may contain `{token}`, replaced by the key's label.
- `issues` are `{ key, message }`; each item names the key by its label and then the message. A polite live region holds the count, or `labels.noIssues` when there are none.
- `children` is a slot under the name for extra fields; it adds no primary button of its own.
- `nameError` shows under the name with `aria-invalid`.
- No text of its own; every string is a prop. One column under 600px.

## CSS classes
`.x-theme-editor`, `.x-theme-editor-group`, `.x-theme-editor-issues`, `.x-theme-editor-count`, `.x-theme-editor-issue-list`.
