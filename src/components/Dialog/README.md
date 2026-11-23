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
- `secondaryActions` adds more choices between Cancel and the confirm button, as `Button variant="secondary"` ("Only this one" beside "Whole series"). Keep it to one or two; the confirm button stays the one primary, last. `busy` does not disable them: pass `disabled` yourself.
- `busy` disables both actions, shows a spinner in the confirm button, sets `aria-busy` and ignores Esc until the work ends.
- `actions` replaces the built-in Cancel and confirm buttons with your own row: a form's submit with `form="…"`, a single Close for a read-only dialog, or a footer with a status line. `actions={null}` renders no action row. Keep one primary button, last.
- `dismissible` adds a close button (×) beside the title that calls `onCancel`; use it when the dialog has no Cancel of its own (a details or share dialog). `labels.close` names it. It is disabled while `busy`.

## Responsive
- Below 640px a modal dialog opens as a bottom sheet: full width, rounded top corners, safe-area padding. The actions stack, primary on top.
- A tall dialog scrolls inside itself; its height stays under the window.
