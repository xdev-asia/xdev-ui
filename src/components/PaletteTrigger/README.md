# PaletteTrigger

A button that looks like a search field, for the top of the sidebar or the top bar: it opens your `CommandPalette` and shows its shortcut (Ctrl K, ⌘K on a Mac), which it also binds for the whole page.

## Anatomy
`button.x-palette-trigger` > `Icon` (search) + `.x-palette-trigger-text` + `kbd.kbd.x-palette-trigger-key`.

## Rules
- One per app. It opens the palette; it is not a text field and never takes typing.
- The app owns the palette's `open` state: `onOpen` sets it, the palette's `onClose` clears it.
- `hotkey` (default true) binds Ctrl+K and Cmd+K on `document` and sets `aria-keyshortcuts`. Pass `false` when the app binds the key itself; the key hint is then hidden too.
- The key hint shows ⌘K on a Mac after mount; the server render says Ctrl K.
- `labels.search` overrides the English "Search".
