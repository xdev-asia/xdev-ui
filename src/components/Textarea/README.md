# Textarea

Labelled multi-line text input with an optional hint or error, for prompts, notes and env blocks.

## Anatomy
`div.ws-field` > `label[for]`, `textarea.kit-textarea` (`.ws-mono` when `mono`), `small` (hint or error). Same wrapper and states as `Field`.

## Rules
- Label above, sentence case, no trailing colon. Placeholder shows an example, never the label.
- `mono` for anything that is code or machine-read: commands, JSON, `KEY=value` lines, paths.
- `resize="vertical"` by default; `"none"` only inside fixed layouts such as a dialog.
- On error the textarea gets `aria-invalid` and the `small` is linked by `aria-describedby`. The error says what to do.
- `ref` is a plain prop (React 19) typed `Ref<HTMLTextAreaElement>`; it reaches the `textarea`.
