# Platforms: macOS, Windows and Linux

xDev is one Tauri app on three systems. Where the platform guides agree, follow them. Where they disagree, xDev picks one behaviour for every platform unless the system itself owns the behaviour (window controls, the macOS menu bar). Consistency inside the app wins over matching each platform (heuristic 4, https://www.nngroup.com/articles/ten-usability-heuristics/).

## Contents
- Sources
- Decisions
- Dialogs
- Capitalization and writing
- Keyboard shortcuts
- Windows, title bars and menus
- Focus, contrast and type
- Not verified

## Sources

| short name | URL |
|---|---|
| Apple alerts | https://developer.apple.com/design/human-interface-guidelines/alerts |
| Apple menu bar | https://developer.apple.com/design/human-interface-guidelines/the-menu-bar |
| Apple keyboards | https://developer.apple.com/design/human-interface-guidelines/keyboards |
| Apple windows | https://developer.apple.com/design/human-interface-guidelines/windows |
| Apple buttons | https://developer.apple.com/design/human-interface-guidelines/buttons |
| Apple writing | https://developer.apple.com/design/human-interface-guidelines/writing |
| Apple sidebars, toolbars, focus | https://developer.apple.com/design/human-interface-guidelines/sidebars, `toolbars`, `focus-and-selection` |
| MS dialogs | https://learn.microsoft.com/en-us/windows/apps/design/controls/dialogs-and-flyouts/dialogs |
| MS title bar | https://learn.microsoft.com/en-us/windows/apps/design/basics/titlebar-design |
| MS focus visuals | https://learn.microsoft.com/en-us/windows/apps/develop/input/guidelines-for-visualfeedback |
| MS typography | https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/typography |
| MS capitalization | https://learn.microsoft.com/en-us/style-guide/capitalization |
| MS contrast themes | https://learn.microsoft.com/en-us/windows/apps/design/accessibility/high-contrast-themes |
| MS accelerators | https://learn.microsoft.com/en-us/windows/apps/design/input/keyboard-accelerators |
| Fluent 2 type | https://fluent2.microsoft.design/typography |
| GNOME dialogs | https://developer.gnome.org/hig/patterns/feedback/dialogs.html |
| GNOME header bars | https://developer.gnome.org/hig/patterns/containers/header-bars.html |
| GNOME menus | https://developer.gnome.org/hig/patterns/controls/menus.html |
| GNOME keyboard | https://developer.gnome.org/hig/reference/keyboard.html |
| GNOME writing | https://developer.gnome.org/hig/guidelines/writing-style.html |
| GNOME type | https://developer.gnome.org/hig/guidelines/typography.html |
| GNOME utility panes | https://developer.gnome.org/hig/patterns/containers/utility-panes.html |

The Apple pages were read through their JSON data endpoints (`/tutorials/data/design/human-interface-guidelines/<topic>.json`).

## Decisions

| topic | macOS | Windows | GNOME | xDev decision |
|---|---|---|---|---|
| Dialog button order | Default button trailing, Cancel leading | Primary leftmost, Close or Cancel rightmost | Cancel first, affirmative after it | Cancel first, primary last, on all three. Windows differs; accepted for one muscle memory across the app |
| Esc in a dialog | Cancels | Triggers the Close button | Activates Cancel | Esc cancels |
| Enter in a dialog | Default button; never Cancel or a destructive button | Only if a default button is set | Affirmative, but not if destructive | Enter confirms, except in an `alert` dialog for a destructive action, where nothing is the default |
| Button label | Verb; "OK" only for purely informational alerts | One or two words | Specific imperative verb rather than OK | Specific verb that repeats the title's verb ("Delete branch") |
| Capitalization | Title-style for buttons and menu titles | Sentence case for all UI text | Header case for buttons, menus, tooltips; sentence case for check boxes and labels | Sentence case everywhere. macOS and GNOME title styles are accepted divergences |
| Ellipsis | When more input is needed | not stated | When more input is needed, not on Preferences | "…" on a command that opens a dialog asking for input |
| Settings | Cmd+, | not in the accelerator table | Ctrl+, | Cmd+, and Ctrl+, |
| Quit | Cmd+Q | not in the accelerator table | Ctrl+Q | Cmd+Q and Ctrl+Q |
| Close | Cmd+W closes the window | Ctrl+W | Ctrl+W | Cmd+W and Ctrl+W close the active tab; a window closes when its last tab closes [Inference] |
| Next pane | not stated | F6 | not stated | F6 moves focus to the next pane; also the exit key from a terminal pane (WCAG 2.1.2) |
| Window controls | System frame; avoid custom frames and controls | Caption buttons on the right, always visible | Header bar keeps blank space to drag | Native decorations on every platform. Custom title bar areas stay draggable and never cover the controls |
| Modifier order in shortcut labels | Control, Option, Shift, Command | not stated | not stated | `Kbd` lists modifiers in Apple order on macOS; Ctrl, Alt, Shift elsewhere [Inference] |
| Fonts | San Francisco (per Fluent 2's macOS ramp) | Segoe UI Variable | Adwaita Sans | System UI font stack through the `--type-*` tokens; no bundled UI font |

## Dialogs

- macOS: "Always place the default button on the trailing side of a row." "Cancel buttons are typically on the leading side." Do not make Cancel the default. Destructive style marks an action people did not choose on purpose. "Avoid using OK as the default button title unless the alert is purely informational." (Apple alerts)
- Windows: "The 'do it' action button(s) should appear as the leftmost buttons. The safe, nondestructive action should appear as the rightmost button." No default button unless one is set; Esc triggers the Close button. (MS dialogs)
- GNOME: "Always ensure that the cancel button appears first, before the affirmative button." Return activates the affirmative button, but not for an irreversible or destructive action. Esc activates Cancel. (GNOME dialogs)
- In xDev: `Dialog` puts Cancel first and the primary last in `.dialog-actions`. Destructive confirms use `alert` and `modal`.

## Capitalization and writing

- macOS buttons use title-style capitalization and start with a verb; menu titles of several words use title style. "Choose a style for each UI element type and use it consistently." (Apple buttons, menu bar, writing)
- Windows: "Use sentence casing for all UI text, including titles." (MS typography; MS capitalization)
- GNOME: header capitalization for headings, buttons, switches, menu items and tooltips; sentence capitalization for check boxes, radio buttons, field labels and body text. (GNOME writing)
- In xDev: sentence case for every string in `en` and `vi`, no emoji, no exclamation marks. The review audit `label-voice` warns on Title Case.

## Keyboard shortcuts

- Apple: Cmd+, opens settings, Cmd+W closes the active window, Cmd+Q quits, Cmd+N opens a new document. "Don't repurpose standard keyboard shortcuts." (Apple keyboards)
- Windows accelerator table: Ctrl+W close, Ctrl+S, Ctrl+N, Ctrl+F, F2 rename, F5 or Ctrl+R refresh, F6 next pane, Ctrl+Y redo. Show accelerators in the menu label or tooltip. Ctrl+, and Ctrl+Q are not in the table. (MS accelerators)
- GNOME: Ctrl+Q quit, Ctrl+W close, Ctrl+, preferences, F10 primary menu, Ctrl+? shortcuts, F1 help, F9 toggles a utility pane. (GNOME keyboard; GNOME utility panes)
- APG: avoid modifier plus Tab, Enter, Space or Esc; Meta plus a single key; Alt plus a function key; screen reader keys. Context menu is Shift+F10. Redo is Ctrl+Y on Windows and Linux, Cmd+Shift+Z on macOS. (https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)
- In xDev: the primary modifier is Cmd on macOS and Ctrl elsewhere. Every shortcut also has a command palette entry. A terminal pane passes keys to the shell except the app's reserved keys (F6 and the palette chord).

## Windows, title bars and menus

- macOS: "Avoid making custom window frames or controls." Menu order is the app menu, File, Edit, Format, View, app menus, Window, Help; the app menu has About, Settings…, Hide and Quit. "Make every toolbar item available as a command in the menu bar." Sidebars show at most two levels and are not hidden by default. (Apple windows, menu bar, toolbars, sidebars)
- Windows: title bar 32px (48px with a search box); caption controls anchored right and always visible; all empty title bar space draggable; double-click toggles maximize. (MS title bar)
- GNOME: main actions at the start of the header bar, the title in the centre, menus at the end; keep blank space to drag. The primary menu ends with Preferences, Keyboard Shortcuts, Help and About, and holds no Close or Quit. (GNOME header bars, menus)
- In xDev: native decorations; on macOS a native menu bar with the standard order; on Windows and Linux the same commands in the app menu and the command palette.

## Focus, contrast and type

- macOS: focus ring for text and search fields, highlight for list and collection selection; Tab moves among focus groups. (Apple focus and selection)
- Windows focus visual: 2px primary border, 1px secondary border, 1px margin. (MS focus visuals) In xDev the ring is `--x-color-focus`, which passes 3:1 on every ground.
- Windows contrast themes: "Do not hard-code colors" in high contrast; use system colour pairs; 2px borders on flyouts and dialogs; GrayText only for disabled content. (MS contrast themes) In CSS this is `forced-colors: active` with system colours (see the standards map, M5 and M6).
- Type: Windows minimum 12px regular or 14px semibold, semibold instead of bold, sentence case; GNOME: do not hard-code font sizes, avoid italic, use real Unicode punctuation. (MS typography; GNOME type) In xDev all sizes come from `--type-*` tokens.

## Not verified

- [Unverified] Where macOS places the window controls: the Apple windows page only says the frame "can include window controls".
- [Unverified] Where GNOME places the close button: the header bars page does not say.
- [Unverified] The Fluent 2 dialog page does not state button order.
- [Unverified] Whether Ctrl+, and Ctrl+Q have a Windows convention outside the accelerator table.
- [Unverified] Windows guidance to hide focus rectangles for mouse input came from a search snippet, not a fetched page.
