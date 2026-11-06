# Standards map

One row per rule: the source, what it means in xDev, and the pass or fail check. "audit" means a rule of `xdev-ui-review/scripts/audit.mjs`. Quotes came through a page summarizer, so they may differ from the page in small ways [Unverified]; the URL is the authority.

## Contents
- Sources
- Colour and contrast
- Text and layout
- Keyboard and focus
- Pointer targets
- Predictable behaviour
- Input and errors
- Names, roles and status
- Motion and user preferences
- Desktop tool conventions
- Token contrast results

## Sources

| short name | URL |
|---|---|
| WCAG | https://www.w3.org/TR/WCAG22/ |
| Understanding | https://www.w3.org/WAI/WCAG22/Understanding/ followed by the slug and `.html` |
| C39 | https://www.w3.org/WAI/WCAG22/Techniques/css/C39 |
| APG keyboard | https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/ |
| APG names | https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/ |
| MDN live regions | https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions |
| MDN reduced motion | https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion |
| MDN contrast | https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-contrast |
| MDN forced colours | https://developer.mozilla.org/en-US/docs/Web/CSS/@media/forced-colors |
| MDN system colours | https://developer.mozilla.org/en-US/docs/Web/CSS/system-color |
| Heuristics | https://www.nngroup.com/articles/ten-usability-heuristics/ |
| VS Code UX | https://code.visualstudio.com/api/ux-guidelines/ followed by the page name |

## Colour and contrast

| id | rule | source | in xDev | check |
|---|---|---|---|---|
| C1 | Contrast is `(L1 + 0.05) / (L2 + 0.05)` with sRGB linearised at 0.04045; never round, 4.499:1 fails | WCAG glossary; Understanding `contrast-minimum` | Translucent grounds are composited over their base before measuring | audit `contrast` uses this formula |
| C2 | Text and images of text 4.5:1; large text (24px, or 18.5px bold) 3:1; inactive, decorative and logo text exempt | WCAG 1.4.3 AA; Understanding `contrast-minimum` | Body, label and hint text use `--text-1`, `--text-2`, `--x-color-ink` or `--x-color-muted`. `--text-3` fails 4.5:1 and is allowed only on disabled controls or decoration | audit `--contrast`; by hand for text on tints and images |
| C3 | Parts needed to identify a control or its state, focus indicators and needed graphics 3:1 against adjacent colours; inactive controls exempt | WCAG 1.4.11 AA; Understanding `non-text-contrast` | `--line` and `--x-color-line` are below 3:1. A field or control whose only boundary is that hairline fails; text or an icon that identifies it passes | audit `--contrast` (warn); by hand per control |
| C4 | The focus ring is a UI component state, so it needs 3:1 | Understanding `non-text-contrast` | `--x-color-focus` passes on every ground in both themes | audit `--contrast` (error level) |
| C5 | Information is not conveyed by colour alone | Understanding `error-identification` (errors must be in text) | A `StatusDot` has a text label or a tooltip with the state; errors use `Field` `error` text | by hand |

## Text and layout

| id | rule | source | in xDev | check |
|---|---|---|---|---|
| L1 | No loss with line height 1.5, paragraph spacing 2, letter spacing 0.12 and word spacing 0.16 times the font size | WCAG 1.4.12 AA; Understanding `text-spacing` | No fixed `height` on boxes that hold text; truncate with an ellipsis only when the full text is reachable (tooltip, detail) | by hand: apply the four values together and look for clipping |
| L2 | No two-dimensional scroll at 320 CSS px wide or 256 CSS px high, except regions that need 2D layout (data tables, diagrams, editors, toolbars that must stay in view) | WCAG 1.4.10 AA; Understanding `reflow` | Terminal, diff and editor panes are the 2D exception; their headers, search fields and dialogs still reflow | by hand at 320px wide |
| L3 | Content shown on hover or focus can be dismissed with Esc, can be hovered, and stays until dismissed | WCAG 1.4.13 AA; Understanding `content-on-hover-or-focus` | `Tooltip` closes on Esc; the pointer can move onto `Popover` | by hand |

## Keyboard and focus

| id | rule | source | in xDev | check |
|---|---|---|---|---|
| K1 | All functions work from the keyboard, except freehand path input | WCAG 2.1.1 A; Understanding `keyboard` (F54) | Drag to resize has `SplitHandle` arrow keys; drag to reorder tabs or panes needs a menu or shortcut equivalent | by hand; no handler on a `div` or `span` without a role and key handler |
| K2 | Focus can always leave a component by keyboard; a non-standard exit is announced | WCAG 2.1.2 A; Understanding `no-keyboard-trap` | A terminal pane takes Tab and Esc, so xDev needs a documented key to leave it (decision: F6, see platforms) | by hand in every terminal and editor pane |
| K3 | Focus order keeps meaning; positive `tabindex` fails (F44) | WCAG 2.4.3 A; Understanding `focus-order` | No `tabIndex` above 0 | audit `positive-tabindex` |
| K4 | A visible focus indicator; removing the outline with no replacement fails (F78) | WCAG 2.4.7 AA; Understanding `focus-visible` | `outline: none` only with a `:focus-visible` replacement for the same selector | audit `focus-outline` |
| K5 | The focused control is not entirely hidden by author content | WCAG 2.4.11 AA; Understanding `focus-not-obscured-minimum` | Sticky headers, the status bar and toasts must not cover it; use `scroll-padding` on scroll containers | by hand: Tab through a long list under a sticky header |
| K6 | A composite widget is one Tab stop; arrows move by roving `tabindex` or `aria-activedescendant` | APG keyboard | Menu, tabs, listbox, tree, toolbar and grid follow their row in the patterns file | by hand per component |
| K7 | Focus never drops to `body`: after a dialog closes, focus the trigger; after a delete, focus the next item | APG keyboard | Lists that delete rows move focus to the next row | by hand |
| K8 | Shortcuts are not the only way to reach a function; avoid modifier plus Tab, Enter, Space or Esc, Meta plus one key, Alt plus a function key, and screen reader keys | APG keyboard | Every shortcut has a menu item or command palette entry | by hand |

## Pointer targets

| id | rule | source | in xDev | check |
|---|---|---|---|---|
| P1 | Targets at least 24 by 24 CSS px, unless a 24px circle centred on each small target touches no other target or circle, an equivalent control exists, the target is inline, or the size is set by the user agent | WCAG 2.5.8 AA; Understanding `target-size-minimum` | Close buttons on tabs, clear buttons in search fields and swatches are the usual misses | audit `target-size` (warn: the spacing exception needs a person); by hand for the circle test |

## Predictable behaviour

| id | rule | source | in xDev | check |
|---|---|---|---|---|
| B1 | Focus alone does not change context | WCAG 3.2.1 A; Understanding `on-focus` | A tab, row or tree item may show its content on focus; it does not open a window or move focus | by hand |
| B2 | Changing a value does not change context without warning; revealing more fields is fine | WCAG 3.2.2 A; Understanding `on-input` | A `Switch` that applies at once is not a change of context; a `Select` that navigates is | by hand |
| B3 | Repeated navigation keeps the same relative order | WCAG 3.2.3 AA; Understanding `consistent-navigation` | Activity bar and sidebar order stays fixed across views | by hand |
| B4 | The same function has the same name and icon everywhere | WCAG 3.2.4 AA; Understanding `consistent-identification` | One verb per action across the app ("Close", not "Close" and "Dismiss") | by hand; review `en` and `vi` strings |
| B5 | Repeated help appears in the same order | WCAG 3.2.6 A; Understanding `consistent-help` | Help and About keep one place in the menu. Whether a single window app is a "set of pages" is not stated on the page [Unverified] | by hand |
| B6 | A timer that hides content needs a way to turn it off, extend it or adjust it, unless the information is available elsewhere | WCAG 2.2.1 A; Understanding `timing-adjustable` | A `Toast` that auto-dismisses repeats information shown elsewhere (the list, the status bar, a log); otherwise it stays until closed | by hand |

## Input and errors

| id | rule | source | in xDev | check |
|---|---|---|---|---|
| E1 | An automatically detected error names the field and says what is wrong in text | WCAG 3.3.1 A; Understanding `error-identification` | `Field` `error` sets the message and `aria-invalid` | by hand |
| E2 | Every input has a label or instructions | WCAG 3.3.2 A; Understanding `labels-or-instructions` | A placeholder is not the label; use `Field` `label` | by hand |
| E3 | Suggest the fix when it is known | WCAG 3.3.3 AA; Understanding `error-suggestion` | "Branch exists. Use feature-2?" instead of "Invalid name" | by hand |
| E4 | Deleting or changing user data is reversible, checked, or confirmed | WCAG 3.3.4 AA; Understanding `error-prevention-legal-financial-data` | Delete uses a modal `Dialog` with `alert`, or an undo | by hand |
| E5 | Do not ask twice for information in the same process | WCAG 3.3.7 A; Understanding `redundant-entry` | Multi-step setup carries values forward | by hand |
| E6 | Sign-in needs no cognitive test without a helper; paste and password managers work; manual code transcription fails | WCAG 3.3.8 AA; Understanding `accessible-authentication-minimum` | The sign-in form allows paste and autofill; device codes can be copied or opened as a link | by hand |

## Names, roles and status

| id | rule | source | in xDev | check |
|---|---|---|---|---|
| N1 | Every control has a name and role; states are exposed and stay in sync (F59 for a `div` used as a control) | WCAG 4.1.2 A; Understanding `name-role-value` | Use library components or native elements; keep `aria-expanded`, `aria-pressed` and `aria-checked` in sync | audit `icon-button-name`; by hand per patterns file |
| N2 | Prefer visible text as the name; use `aria-label` only when there is no visible text; translate it; `title` is a last resort | APG names | `IconButton` `label` and `Icon` `label` come from the string table, in `en` and `vi` | audit `icon-button-name`; `i18n-parity` |
| N3 | Status messages reach assistive technology without focus: `role="status"`, `alert` or `log` | WCAG 4.1.3 AA; Understanding `status-messages` (ARIA22) | `Toast`, `Banner` and `Spinner` already use `role="status"` | by hand: search counts, save confirmations, copy confirmations |
| N4 | A live region exists before its text changes; `polite` is the norm; `assertive` and `alert` sparingly; do not add `aria-live="assertive"` to `role="alert"` | MDN live regions | Mount the toast region once at the shell, then change its text | by hand |

## Motion and user preferences

| id | rule | source | in xDev | check |
|---|---|---|---|---|
| M1 | Motion triggered by interaction can be turned off unless essential; colour, blur and opacity changes are not motion | WCAG 2.3.3 AAA (adopted as a goal); Understanding `animation-from-interactions` | Slides, scales and spins stop under reduced motion; fades may stay | audit `reduced-motion` |
| M2 | Test: turn on reduced motion in the OS; each motion is either essential or suppressed | C39 | A `Spinner` is essential progress feedback [Inference]; it may keep turning | by hand on macOS (Reduce motion) and Windows 11 (Animation effects) |
| M3 | `prefers-reduced-motion` has `no-preference` and `reduce`; the bare query means `reduce` | MDN reduced motion | A single universal guard in the app's base CSS counts for every file | audit `reduced-motion` accepts either form |
| M4 | `prefers-contrast` has `no-preference`, `more`, `less` and `custom`; `custom` matches forced colours | MDN contrast | Raising `--line` and `--text-3` under `more` is the expected fix for C2 and C3; not shipped yet | by hand |
| M5 | Under `forced-colors: active` the browser forces `color`, `background-color`, `border-color`, `outline-color` and SVG `fill` and `stroke`, and sets `box-shadow` and `text-shadow` to none | MDN forced colours | A focus ring or state drawn only with `box-shadow` disappears. A transparent `outline` next to the shadow becomes visible because its colour is forced [Inference] | audit `forced-colors` |
| M6 | Fix forced colours with system colours (`Canvas`, `CanvasText`, `ButtonText`, `ButtonBorder`, `Highlight`, `HighlightText`, `GrayText` for disabled); use `forced-color-adjust: none` only for small parts | MDN forced colours; MDN system colours | Selected rows use `Highlight` and `HighlightText`; disabled text `GrayText` | by hand with a Windows contrast theme |

## Desktop tool conventions

These come from the VS Code UX guidelines. They are advice for a developer tool, not conformance rules.

| id | rule | source page | in xDev |
|---|---|---|---|
| V1 | Notifications only when needed, one at a time, never repeated, never for promotion; offer "Do not show again" | `notifications` | Use `Toast` for results of the user's own action; use the status bar for background state |
| V2 | Background progress goes in the status bar with a loading icon; a progress notification only when attention is needed, with cancel and a details link | `status-bar`, `notifications` | Long jobs show a status bar item; the notification has Cancel |
| V3 | Modal dialogs only when an immediate decision is needed, never for plain messages or actions the user did not start | `notifications` | No modal for "Saved" or "Update available" |
| V4 | Status bar: short text, icons only for clear metaphors, global items left and contextual items right, no custom colours; error backgrounds only as a last resort | `status-bar` | `StatusBar` left is workspace, right is the active pane |
| V5 | Commands have clear names, a category, keyboard shortcuts where useful, no emoji, and do not override existing shortcuts | `command-palette` | `CommandPalette` entries are "Category: Verb object" with the chord shown |
| V6 | Quick picks have a placeholder, use the description for the current value and detail for brief context, and offer "Create new" in a pick list | `quick-picks` | `SearchPicker` and `CommandPalette` placeholders say what is searched |
| V7 | Views: tree items are not single-action buttons, at most three actions per item, few views per sidebar (3 to 5) | `views`, `sidebars` | `TreeView` rows open on Enter; extra actions go in a context menu |
| V8 | Welcome (empty) views: links before buttons, buttons only for primary actions, short content, no "read more" link text | `views` | `EmptyState` has one action and a specific link text |
| V9 | Context menus show only actions that apply, grouped, with large groups in a submenu | `context-menus` | `Menu` groups use separators |
| V10 | Settings have a default and a clear, short description; link related settings | `settings` | `SettingRow` has a description; the default is shown or resettable |

## Token contrast results

Measured with the C1 formula over the dark and light values in `ai-manifest.json`. Every pair at error level passes (body and muted text on every ground, signal colours on their tints, focus ring on nine grounds). These pairs fail; the audit reports them as warnings and the tokens are unchanged pending a design decision.

| pair | need | dark | light |
|---|---|---|---|
| `--text-3` on `--bg-0` | 4.5 | 3.26 | 3.11 |
| `--text-3` on `--bg-1` | 4.5 | 3.15 | 3.42 |
| `--text-3` on `--bg-2` | 4.5 | 2.99 | 3.42 |
| `--line` on `--bg-0` | 3 | 1.26 | 1.22 |
| `--line` on `--bg-1` | 3 | 1.22 | 1.34 |
| `--line` on `--bg-2` | 3 | 1.15 | 1.34 |
| `--x-color-line` on bg | 3 | 1.48 | 1.20 |
| `--x-color-line` on panel | 3 | 1.39 | 1.35 |
| `--x-color-line` on surface | 3 | 1.30 | 1.35 |

A hairline between regions is not a control boundary and needs no ratio. The risk is a field or control whose only visible edge is one of these lines (C3).
