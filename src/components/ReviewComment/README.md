An inline comment on a line of a diff: author, time, the file and line it is about, the text, an optional suggested change and a resolve button. It is a `Comment` with review parts, so it looks like every other comment.

## Rules
- Use it under a diff line in a review. A plain conversation comment is a `Comment`; extending `Comment` itself would put review strings into it, so this part composes it.
- `line` is required: a number or a range label. With `file` the location reads "src/app.ts · Line 42"; without it, "Line 42". The words come from `labels.line`.
- `suggestion` is replacement code, shown as text in a `pre` under the body with the heading `labels.suggestion`. It is never run or rendered as HTML.
- `onResolve` shows a secondary small "Resolve" button in the header while the thread is open. `resolved` fades the body, sets the `Comment` resolved tint and shows the `labels.resolved` badge; `onReopen` then shows "Reopen". No handler, no button.
- Put a reply box or reactions in `footer`.
- `labels` translates `line`, `suggestion`, `resolve`, `reopen` and `resolved`. The component has no other strings.
- `body` is the text: render user text through a sanitizing renderer, never raw HTML.
- State is a tint, never a coloured stripe.
- The suggestion block scrolls sideways inside the card, so the part works at 360px.
