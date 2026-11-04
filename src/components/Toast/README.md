# Toast

Short-lived confirmation stacked at the bottom-right in `.ws-toasts`.

## Rules
- One sentence, past tense, saying what happened ("Session archived.").
- At most one action, usually Undo.
- `role="status"`, so screen readers announce it without moving focus.
- Never put errors that need a decision in a toast: use a `Dialog` or `Banner`.
- `labels` (`ToastLabels`: `dismiss`) overrides the English default.
