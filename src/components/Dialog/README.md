# Dialog

Modal confirmation over a dimmed backdrop, for decisions that cannot be undone.

## Rules
- Title is the question, naming the object: "Kill session fix-auth-redirect?"
- Body: one or two sentences on the consequence.
- Actions right-aligned: secondary Cancel, then the primary verb that repeats the title ("Kill session").
- Use `alert` (`role="alertdialog"`) for destructive confirms.
- Pass `modal` in an app: the backdrop becomes `position: fixed` (`data-modal`), Esc calls `onCancel`, Tab and Shift+Tab wrap inside the dialog, the rest of the page is `inert` while it is open, focus moves to the first control on mount and returns to the trigger on unmount. Without `modal` it renders the markup only (used for previews inside a card).
- A string child renders in `p.dialog-body`; an element child (a form) renders in `div.dialog-body`.
- `confirmDisabled` disables the primary button while saving or while the form is invalid.
- With `modal` it renders into `document.body` once mounted, so no parent clips it; `portal={false}` keeps it in place. The server render and non-modal previews are always inline.
- `labels` (`DialogLabels`: `confirm`, `cancel`) overrides the English defaults; pass translated strings from the app.
- `description` renders one line in `p.dialog-desc` under the title and is linked with `aria-describedby`.
- `tone="danger"` gives the confirm button the `danger` variant; pair it with `alert` for destructive confirms.
- `busy` disables both actions, shows a spinner in the confirm button, sets `aria-busy` and ignores Esc until the work ends.
