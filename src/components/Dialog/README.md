# Dialog

Modal confirmation over a dimmed backdrop, for decisions that cannot be undone.

## Rules
- Title is the question, naming the object: "Kill session fix-auth-redirect?"
- Body: one or two sentences on the consequence.
- Actions right-aligned: secondary Cancel, then the primary verb that repeats the title ("Kill session").
- Use `alert` (`role="alertdialog"`) for destructive confirms.
- Pass `modal` in an app: the backdrop becomes `position: fixed` (`data-modal`), Esc calls `onCancel`, focus moves to the first control on mount and returns to the trigger on unmount. Without `modal` it renders the markup only (used for previews inside a card).
- A string child renders in `p.dialog-body`; an element child (a form) renders in `div.dialog-body`.
- `confirmDisabled` disables the primary button while saving or while the form is invalid.
- `labels` (`DialogLabels`: `confirm`, `cancel`) overrides the English defaults; pass translated strings from the app.
