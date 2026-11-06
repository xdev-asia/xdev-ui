# Keyboard and ARIA contract per component

Each component in `src/components` maps to an APG pattern, a native element, or "static" (no interaction). The contract is what a keyboard and screen reader user must get. "Gap" marks where the component does not meet its pattern yet; fix it in the library.

Pattern pages are under https://www.w3.org/WAI/ARIA/apg/patterns/ followed by the slug in the table. Keyboard practice: https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/. Names: https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/.

## Contents
- Shared rules
- Pattern contracts
- Overlays
- Navigation
- Inputs
- Actions
- Status and feedback
- Display and static parts

## Shared rules

- No ARIA is better than bad ARIA: a role promises the keyboard behaviour of that pattern (APG read me first, https://www.w3.org/WAI/ARIA/apg/practices/read-me-first/).
- A composite widget is one Tab stop. Roving `tabindex`: the active item has `0`, the rest `-1`, and arrow keys move `focus()`. `aria-activedescendant`: focus stays on the container or input, which points at the active item's id; scroll it into view yourself.
- Disabled items in menus stay focusable by arrows and use `aria-disabled`.
- Names come from visible text first, then `aria-labelledby`, then `aria-label`. Every `aria-label` is a translated string.
- Positive `tabindex` is never used (WCAG F44).

## Pattern contracts

| pattern (slug) | roles and attributes | keys |
|---|---|---|
| Modal dialog (`dialog-modal`) | `dialog`, `aria-modal="true"`, `aria-labelledby` to the title; `aria-describedby` optional | Focus moves in on open; Tab and Shift+Tab wrap; Esc closes; focus returns to the trigger |
| Alert dialog (`alertdialog`) | `alertdialog`, `aria-modal="true"`, `aria-labelledby` to the title, `aria-describedby` to the message | As modal dialog |
| Menu and menubar (`menubar`), menu button (`menu-button`) | `menu` with `menuitem`, `menuitemcheckbox`, `menuitemradio`, `separator`; the button has `aria-haspopup="menu"` and `aria-expanded` | Enter, Space or Down opens on the first item, Up on the last; Up and Down move; Home and End; typeahead optional; Enter activates and closes; Space toggles a check item; Esc closes and returns focus to the button; Tab closes |
| Tabs (`tabs`) | `tablist` (named) owns only `tab` elements; `aria-selected`; `aria-controls` to the `tabpanel`, which has `aria-labelledby` | Tab lands on the active tab; Left and Right move and wrap; Home and End optional; Delete may close the tab and focus the next one; Shift+F10 opens the tab's menu |
| Listbox (`listbox`) | `listbox` (named unless in a combobox) with `option`; `aria-selected`; named `group` for sections | Up and Down; Home and End for more than 5 options; typeahead for more than 7 |
| Combobox (`combobox`) | `combobox` on the input with `aria-expanded`, `aria-controls`, `aria-activedescendant`, `aria-autocomplete` | Focus stays in the input; Down enters the list; Enter accepts and closes; Esc closes, then may clear |
| Tree view (`treeview`) | `tree` (named), `treeitem`, child items in `group`; `aria-expanded` on parents only; `aria-level` | Up and Down; Right opens or moves to the first child; Left closes or moves to the parent; Home and End; Enter runs the default action; typeahead recommended |
| Grid (`grid`) | `grid`, `row`, `gridcell`, `columnheader`; `aria-sort` on the sorted header | Arrows move one cell; Home, End, Ctrl+Home, Ctrl+End; Enter or F2 enters a cell, Esc leaves it |
| Radio group (`radio`) | `radiogroup` (named) with `radio` and `aria-checked` | Tab enters on the checked radio; arrows move and check |
| Toolbar (`toolbar`) | `toolbar` (named); `aria-orientation` when vertical | One Tab stop; Left and Right move; Home and End optional |
| Tooltip (`tooltip`) | `tooltip`; the trigger has `aria-describedby` | Shows on focus and hover; Esc hides; never takes focus. The pattern is a work in progress without task force consensus [Unverified as final] |
| Disclosure (`disclosure`) | `button` with `aria-expanded`; `aria-controls` optional | Enter or Space toggles |
| Switch (`switch`) | `switch` with `aria-checked`, or a native checkbox; the label does not change with the state | Space toggles; Enter optional |
| Accordion (`accordion`) | header `button` inside a `heading`, with `aria-expanded` and `aria-controls` | Enter or Space; arrow keys not confirmed on the page [Unverified] |
| Breadcrumb (`breadcrumb`) | `nav` (named) with `aria-current="page"` on the current item | none |

## Overlays

| component | pattern | contract and status |
|---|---|---|
| `Dialog` | Modal dialog; Alert dialog with `alert` | Meets the modal contract: focus in, Tab wraps, Esc calls `onCancel`, page behind is inert, focus returns. Gap: with `alert`, no `aria-describedby` points at the message |
| `CommandPalette` | Combobox with a listbox popup inside a dialog | Gap: the input has no `combobox` role, `aria-expanded`, `aria-controls` or `aria-activedescendant`; no arrow key, Enter or Esc handling; options have no click or keyboard action. The app must wire these today |
| `Popover` | Non-modal dialog opened by a button | Trigger gets `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls`; panel takes focus; Esc closes; focus returns. Name it with `label` |
| `Menu` | Menu | Gap: renders `menu` and `menuitem` roles but has no arrow keys, Home, End, typeahead, roving focus or Esc; the opener does not get `aria-haspopup`. Do not use it as a keyboard menu until fixed |
| `Tooltip` | Tooltip | Meets the contract. The tip is inside the hover anchor, so it stays while the pointer is over it (WCAG 1.4.13) [Inference: not tested with a gap between trigger and tip]. Never put a control inside it; never attach it to a disabled control |
| `SearchPicker` | Combobox with listbox | Meets the contract: `aria-activedescendant`, Up, Down, Esc, `aria-expanded`, `aria-autocomplete` |

## Navigation

| component | pattern | contract and status |
|---|---|---|
| `Tabs` | Tabs | Meets the contract: arrows, Home, End, `aria-controls`, panels labelled |
| `TabStrip` | Tabs | Gap: no arrow keys, every tab is a Tab stop; close buttons are children of the tablist, which may own only tabs; `aria-selected` is also set on a presentation wrapper. Close button `.ws-tab-close` is under 24px |
| `TreeView` | Tree view | Meets the contract: arrows, Home, End, `aria-level`, `aria-expanded` |
| `NavList` | Native links in a named `nav` | `aria-current` on the current link; Tab order is the list order |
| `ActivityBar` | Native buttons in a named `nav` | `aria-current` on the active view; each button needs a `label` |
| `Breadcrumb` | Breadcrumb | Meets the contract |
| `Disclosure` | Disclosure | Meets the contract |
| `SplitHandle` | Window splitter (`separator` with a value) | Focusable, `aria-valuenow`, arrows, Home and End resize (keyboard equivalent of drag, WCAG 2.1.1) |
| `Toolbar`, `ZoomBar` | Toolbar | Arrows move. Gap: every control stays in the Tab order instead of one Tab stop |
| `StatusBar` | Static region | Items that act are buttons; text updates that matter use a `role="status"` child |
| `Pagination` | Native `nav`, buttons and `select` | Page summary is `aria-live="polite"` |
| `PageHeader` | Static heading with actions | One primary action |
| `AppShell` | Landmarks plus a modal drawer | Skip link `.x-skip-link` first; drawer traps Tab, Esc closes, focus returns |

## Inputs

| component | pattern | contract and status |
|---|---|---|
| `Field`, `Textarea`, `FontField` | Native input with label | `label` is visible; `error` sets `aria-invalid` and `aria-describedby` |
| `SearchInput` | Native search input | Clear button named; result count `aria-live="polite"`. Clear button is under 24px |
| `Select` | Native `select` | Name with `label` |
| `Checkbox` | Native checkbox | Space toggles |
| `RadioGroup` | Radio group (native radios) | Native arrow keys; `radiogroup` named |
| `Switch` | Switch (native checkbox with `role="switch"`) | Label does not change with state |
| `Segmented`, `ThemeSwitch`, `FilterChip`, `ReactionBar` | Toggle buttons (`aria-pressed`) in a named `group` | Each button is a Tab stop; Space or Enter toggles. A radio group in a toolbar is the stricter pattern [Inference] |
| `Tag` | Static text with an optional remove button | Removable tag is focusable; Backspace removes; the remove button is out of the Tab order and under 24px |
| `SettingRow`, `FormSection` | Native label and control | Description linked by `aria-describedby` |

## Actions

| component | pattern | contract and status |
|---|---|---|
| `Button` | Native button | One primary per surface; disabled state uses the native attribute |
| `IconButton` | Native button | `label` is required and becomes the name; `.ws-icon-btn` is the size to keep at 24px or more |
| `ActionTile`, `Card` (with action), `ListRow`, `EmptyState` action | Native button | Name from visible text |
| `CodeBlock` | Native button for copy | Copy confirmation is `aria-live` |
| `PanZoom` | Focusable `group` | `+`, `-` and `0` zoom; drag pan needs a keyboard equivalent (arrows) [Inference: not in `zoomKey`] |
| `Comment` | Native buttons | Actions named by text |

## Status and feedback

| component | pattern | contract and status |
|---|---|---|
| `Toast` | Live region `role="status"` | Auto-dismiss only for information shown elsewhere (WCAG 2.2.1); close button named |
| `Banner` | Live region `role="status"` | Errors that block work may use `alert` sparingly |
| `FieldMessage` | `role="alert"` | Linked to its input by `aria-describedby` |
| `Spinner` | `role="status"` with a name | One per region |
| `Meter` | `meter` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and a name | Value also shown as text |
| `StatTile` | Static text; `aria-busy` while loading | Delta direction in text, not colour only |
| `StatusDot` | Decorative (`aria-hidden`) | Its state must be in nearby text or the parent's name |

## Display and static parts

| component | contract |
|---|---|
| `Icon` | `aria-hidden` unless `label` is set, then `role="img"` with that name |
| `Avatar`, `AgentChip`, `BrandMark`, `Heatmap`, `FileIcon` | `role="img"` with a name, or hidden when the text next to it names it |
| `DataTable` | Native `table` with `caption`; sort buttons in headers set `aria-sort`; row selection uses checkboxes. It is a table, not a grid: no arrow keys expected |
| `DiffStat` | Named with the counts in words |
| `CommitGraph` | Hidden; the commit list carries the information |
| `Badge`, `Kbd`, `DescriptionList` | Static |
