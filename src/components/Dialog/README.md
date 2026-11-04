# Dialog

Modal confirmation over a dimmed backdrop, for decisions that cannot be undone.

## Rules
- Title is the question, naming the object: "Kill session fix-auth-redirect?"
- Body: one or two sentences on the consequence.
- Actions right-aligned: secondary Cancel, then the primary verb that repeats the title ("Kill session").
- Use `alert` (`role="alertdialog"`) for destructive confirms.
- Focus moves into the dialog on open and returns to the trigger on close; Esc cancels. The bundle renders the markup only; wire focus handling in the host app.
- The preview places it inside the card; in the app the backdrop is `position: fixed`.
