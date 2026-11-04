# Menu

Context and dropdown menu with chords, checks, colour swatches, groups and a danger item.

## Rules
- `role="menu"`; checkable items are `menuitemcheckbox` with `aria-checked`.
- Order: common actions, then view toggles under a group label, then the destructive item last after a separator.
- Danger items use `--danger` text only; they still need a confirming `Dialog` when the action cannot be undone.
- Disabled items stay visible with `aria-disabled`.
- Shadow: `--shadow-menu`. Menus are the only floating surface besides dialogs and the palette.
- The preview renders inline. In the app, position it against its trigger and close on Esc and outside click.
