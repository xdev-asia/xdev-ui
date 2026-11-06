# SaveBar

Bar pinned to the bottom of a long edit form that appears when there are unsaved changes, with Discard and Save; `useUnsavedGuard` asks before the user leaves with those changes.

## Anatomy
`div.x-savebar[role=region]` > `p.x-savebar-msg[role=status|alert]` + `div.x-savebar-actions` (Discard, Save).

## Rules
- For edit pages and settings pages whose form is longer than one screen. A short form in a `FormDialog` or `Drawer` does not need it.
- Show it only while `dirty` (the form differs from the saved data) or `busy`; it renders nothing otherwise.
- Place it as the last child of the scrolling page content; it sticks to the bottom of that container.
- The page's own primary button is Save here; do not add a second Save in the page header.
- On failure pass `error` (announced as an alert) and keep the changes; never discard them on error.
- Call `useUnsavedGuard(dirty, message)` in the same page: it covers closing or reloading the tab. Before an in-app navigation or closing a drawer, call `confirmLeave()`.
- Translate every string with `labels` and the hook's `message`.
