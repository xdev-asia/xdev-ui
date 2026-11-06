# Menu

Context and dropdown menu with chords, checks, colour swatches, groups and a danger item.

## Rules
- `role="menu"`; checkable items are `menuitemcheckbox` with `aria-checked`.
- Order: common actions, then view toggles under a group label, then the destructive item last after a separator.
- Danger items use `--danger` text only; they still need a confirming `Dialog` when the action cannot be undone.
- Disabled items stay visible with `aria-disabled`.
- Shadow: `--shadow-menu`. Menus are the only floating surface besides dialogs and the palette.
- Keyboard (menu-button pattern): the menu focuses its first item on open (`initialFocus="last"` for ArrowUp on the trigger; `menuTriggerKey(key)` maps the trigger key). Up/Down wrap, Home/End jump, a letter jumps to the next item starting with it, disabled items are skipped. Esc returns focus to the trigger and calls `onClose`; Tab calls `onClose`.
- The preview renders inline. In the app, position it against its trigger and close on Esc and outside click.
