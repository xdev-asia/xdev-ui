# Drawer

Panel that slides in from the side of the window over a dimmed page, for quick edits and details without leaving the list.

## Anatomy
`div.x-drawer-root[data-modal]` > `div.x-drawer-backdrop` + `div.x-drawer[role=dialog][data-size][data-side]` > `header.x-drawer-head` (title, description, close) + `div.x-drawer-body` (scrolls) + `footer.x-drawer-foot`.

## Rules
- Use it to edit or inspect one row of a list while the list stays in view. A long or multi-step form gets its own page; a yes/no question is a `Dialog`.
- `side` is `end` (default), `start` or `bottom`. `bottom` is a sheet: full width, at most 85% of the height, rounded top corners; use it on phones.
- Mount it to open it and unmount it to close it, like `Dialog`. Focus moves in on mount, Tab stays inside, the page behind is `inert`, focus returns to the trigger on unmount.
- Esc, the close button and a click on the backdrop call `onClose`. While `busy` (saving) they do nothing; show the work in the footer button.
- Footer: secondary Cancel, then one primary Button, right-aligned.
- If the form has unsaved changes, ask before closing (`useUnsavedGuard` covers leaving the page, not closing the drawer).
- `labels.close` translates the close button.
- A modal drawer renders into `document.body` once mounted, so no parent clips it; `portal={false}` keeps it in place. The server render and `modal={false}` previews are always inline.
