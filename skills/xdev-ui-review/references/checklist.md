# Pre-delivery checklist

The only pre-delivery checklist for UI built with `@xdev-asia/ui`. The admin and build skills end here; the standards skill adds the WCAG and heuristics pass on top. Tick each item in the running app. Items marked (auto) are also flagged by `scripts/audit.mjs`. Mark an item you could not run as "not run"; never tick it.

## Contents
- Process
- Tokens and identity
- Layout
- Themes and language
- Keyboard, focus and names
- States and data safety
- Forms
- Lists
- Actions and labels
- Code
- Page types and standards

## Process
- [ ] The audit ran over the source folder with `--i18n`, and every error is fixed, not silenced.
- [ ] Every part was checked with `xdevui_get_component`; no prop, token or class name was guessed.
- [ ] The page was looked at in the running app with real data, not only read in the source.
- [ ] Dark and light were each checked on screen; one theme was not inferred from the other.
- [ ] Widths 375, 768 and 1440px were checked, then 320px for overflow; 375 and the desktop width were screenshotted.
- [ ] The page was checked with reduced motion on.

## Tokens and identity
- [ ] (auto) No colour literal, no raw `px` except 1px hairlines, no raw font size: `font: var(--type-*)`.
- [ ] Spacing uses `--x-space-1` to `--x-space-8`; widths use `%`, `ch`, `rem`, `--w-side` or `--w-panel`; no numeric z-index.
- [ ] Cyan `--x-color-signal` appears only as the focus ring. The one accent `--accent` marks the current thing.
- [ ] Hairlines (1px `--line`) separate regions; shadows only on menus, dialogs and the command palette.
- [ ] (auto) State is a tint, a 1px border or a `StatusDot`; never a coloured left stripe on a rounded card or row.
- [ ] Icons come from `Icon` (`xdevui_list_icons`); no emoji or raster image as an icon; the brand is `BrandMark`, never recoloured.

## Layout
- [ ] No horizontal scroll on the page at any width. (auto, partial) `fixed-width` and `nowrap`.
- [ ] A `DataTable` scrolls inside its own wrapper, with actions `sticky="end"` or `stack`; `hideNarrow` columns have dropped.
- [ ] The `AppShell` sidebar is a drawer on a phone: the menu button opens it, the backdrop and Esc close it.
- [ ] `Dialog` and `FormDialog` (modal) open as a bottom sheet below 640px; a `Drawer` takes the full width.
- [ ] `PageHeader` actions wrap under the title; `FormSection` is one column; `Pagination` fits on one or two lines.
- [ ] Content that loads later has its space reserved (`Skeleton` in its shape), so nothing jumps when it arrives.
- [ ] Touch targets are at least `--x-space-6` high (44px under `pointer: coarse`); nothing overlaps. (auto, partial) `target-size`.

## Themes and language
- [ ] In both themes no text loses contrast, no surface turns white or black by accident, and borders and selected rows stay visible.
- [ ] Switching `en` and `vi` changes every label, clips nothing, and library parts get `labels` in the active language.
- [ ] (auto) `en` and `vi` have the same keys and no empty values.
- [ ] Dates and numbers use `Intl.DateTimeFormat(locale)` and `Intl.NumberFormat(locale)`; stored dates are ISO `YYYY-MM-DD`.

## Keyboard, focus and names
- [ ] Tab order follows the reading order; the focus ring is visible on every stop; the skip link is first and jumps to `main`.
- [ ] (auto) No `outline: none` without a `:focus-visible` replacement; no positive `tabIndex`; icon-only buttons are named.
- [ ] A focused control is never fully hidden behind a sticky header, a `SaveBar` or a `Toast`.
- [ ] A modal `Dialog` moves focus in, Esc cancels, and focus returns to the trigger.
- [ ] Icon-only controls are `IconButton` with a `label`; a toggle exposes its pressed, selected or expanded state.
- [ ] An `Icon` next to visible text has no `label`, so it stays hidden from screen readers; an icon that carries meaning alone has a `label`.
- [ ] Colour is never the only signal: status has text or an icon with a name.
- [ ] Every drag (reorder, resize) also works from the keyboard or a button.

## States and data safety
- [ ] Every data region renders loading, error, empty and success, and each is tested.
- [ ] An empty list says what to do next; an empty search names the query.
- [ ] A failed load shows a `Banner` with a retry action, not a blank page.
- [ ] A saved change shows a `Toast` in past tense; a failed save shows a `Banner` and keeps the user's input.
- [ ] Buttons show `busy` and cannot submit twice; uploads lock Save while busy.
- [ ] Nothing moves, slides or spins under reduced motion except progress. (auto) `reduced-motion`.
- [ ] Nothing advances by itself (carousel, ticker, rotating tip) unless it has a pause control and stops on focus.

## Forms
- [ ] The container fits the form: `FormDialog` up to ~5 fields, `Drawer` with the list in view, a page with `SaveBar` for longer.
- [ ] Every field has a visible label; hints say the format; errors sit on the field in text and keep the values.
- [ ] A form that fails with several errors also moves focus to a summary that links to each field.
- [ ] Leaving a dirty form asks (`useUnsavedGuard`, `confirmLeave`).
- [ ] Sign-in fields allow paste and password managers. (auto) `autocomplete`.

## Lists
- [ ] Search, filters, sort, page and tab live in the URL; a filter change resets the page to 1.
- [ ] Facets show counts (`FilterChip` or `FacetFilter`); a selection shows a `BulkBar`; destructive bulk actions confirm with the count.
- [ ] Reorder only for manually ordered lists, disabled while sorted. Long lists page with `Pagination`.

## Actions and labels
- [ ] One `PageHeader`, one `h1` and one primary `Button` per surface; the primary is last in its row. (auto) `primary-count`.
- [ ] Destructive confirms use `Dialog` with `alert` and `modal`; the title names the object ("Delete user Ada?") and the primary repeats the verb.
- [ ] Actions the role can never do are hidden; actions not possible yet are disabled with the reason written next to them, not in a `Tooltip`. The server checks again.
- [ ] (auto) Labels are sentence-case verbs ("Create session"), with no emoji and no exclamation marks.

## Code
- [ ] Pages are a pure `XView` plus a data-loading `XPage`; views are tested with `renderToStaticMarkup` in every state.
- [ ] Filtering, sorting, validation and CSV are pure functions with unit tests.

## Page types and standards
- [ ] The check for each page type in `references/pages/` was run: list, dashboard, settings, dialogs-forms, sign-in, provider-grid.
- [ ] For WCAG 2.2 AA, the APG patterns and the ten heuristics, walk the heuristics checklist in the `xdev-ui-ux-standards` skill. `--contrast` lists token pairs below WCAG contrast.
