# Menu

Context and dropdown menu with chords, checks, colour swatches, groups and a danger item.

## Rules
- `role="menu"`; checkable items are `menuitemcheckbox` with `aria-checked`.
- Order: common actions, then view toggles under a group label, then the destructive item last after a separator.
- Danger items use `--danger` text only; they still need a confirming `Dialog` when the action cannot be undone.
- Disabled items stay visible with `aria-disabled`.
- Shadow: `--shadow-menu`. Menus are the only floating surface besides dialogs and the palette.
- Keyboard (menu-button pattern): the menu focuses its first item on open (`initialFocus="last"` for ArrowUp on the trigger; `menuTriggerKey(key)` maps the trigger key). Up/Down wrap, Home/End jump, a letter jumps to the next item starting with it, disabled items are skipped. Esc returns focus to the trigger and calls `onClose`; Tab calls `onClose`.
- The preview renders inline. In the app, open it from a `MenuButton`, which positions it and handles the keyboard.
- An item with `href` renders as `<a role="menuitem">`, so middle-click and Cmd/Ctrl-click open a new tab. Pass `renderLink` to render it through a router link (a Next.js `Link`): spread the props it gets.

## MenuButton

`MenuButton` is the trigger that opens a `Menu` (WAI-ARIA menu button pattern).

- Props: `items`, `label` (button text; aria-label with `variant="icon"`), `icon`, `variant` (`primary`, `secondary` default, `icon`), `align` (`start` default, `end`), `menuLabel`, `renderLink`, `disabled`, `portal`.
- The trigger has `aria-haspopup="menu"` and `aria-expanded`. Enter, Space, a click or ArrowDown open the menu on the first item; ArrowUp on the last.
- Inside: ArrowUp and ArrowDown move and wrap, Home and End jump, typing a letter jumps to the next item starting with it. Esc and a click outside close it and return focus to the trigger; Tab closes it and moves on.
- Choosing an item closes the menu. The menu renders into `document.body` (flips above when there is no room below); `portal={false}` keeps it inside the trigger's wrapper.
- An icon-only trigger (`variant="icon"`, default glyph `more`) is for row actions; name it with `label` ("Actions for Ada").
