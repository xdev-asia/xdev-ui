# Web interface pass

What a code review checks beyond the audit, adapted for `@xdev-asia/ui` from Vercel's Web Interface Guidelines (https://github.com/vercel-labs/web-interface-guidelines). Where the two disagree, xDev's rule is the one written here. Report findings as `file:line - problem`, grouped by file, one line each.

## Contents
- Already done by the library
- Forms
- Links, state and URLs
- Copy and typography
- Headings and content
- Layout and touch
- Theme and locale
- Where xDev differs

## Already done by the library

Do not flag these in an app that uses the parts as documented: focus rings (`:focus-visible`, never removed), icon-only `IconButton` names, `role="status"` toasts, reduced-motion guards in every animated part, `overscroll-behavior: contain` in dialogs, drawers and popover lists, `touch-action: manipulation` on controls, native `select` colours, `color-scheme` per theme, safe-area padding on sheets, the sticky `SaveBar` leaving room for the focused field, and "Loading…" / "Saving…" default labels. Flag them when app CSS overrides them.

## Forms

- Every input has a visible label (`Field`, `Select label`, `Textarea`), a `name`, the right `type` and `inputMode`, and `autoComplete` (`username`, `current-password`, `new-password`, `email`, `tel`, `one-time-code`, or `off` for non-personal fields such as a menu path or a search filter). Audit: `autocomplete`.
- `spellCheck={false}` on emails, usernames, codes, paths and identifiers.
- Paste always works (audit `paste-block`).
- The submit button stays enabled until the request starts, then `busy`. Validate on submit, show the error next to the field and move focus to the first invalid one (`[aria-invalid="true"]`). Do not disable Save because the form is invalid (`SaveBar saveDisabled` is for "nothing to save", not for errors).
- Leaving a dirty form asks first: `useUnsavedGuard` with a translated message.
- A placeholder shows an example and ends with `…` ("Name, path or code…"); it never repeats the label and is never the label.

## Links, state and URLs

- A control that goes somewhere is a link: `Button href`, `<a href>` or the router's link, so Cmd/Ctrl-click and middle-click work. Audit: `nav-onclick`.
- A `div`, `span` or `li` never takes clicks; use `button` for actions. Audit: `click-div`.
- View state lives in the URL: filters, search, sort, page, tab, period, a previewed role. Write it with `history.replaceState` when it changes and read it once as the view's starting state, so reload and a shared link keep it.
- Destructive actions confirm (`Dialog alert`) or offer Undo in a `Toast`; never act at once.

## Copy and typography

- `…` not `...` (audit `ellipsis`); text for a wait ends with it.
- A number and its unit stay together: `10&nbsp;MB`, `Ctrl&nbsp;K`.
- Numbers that line up or change use `--type-mono`, `--type-stat` or `font-variant-numeric: tabular-nums`; table columns of counts set `mono`.
- Second person and active voice, the fix with the problem: "Check the latest email, or send a new code", not "We could not verify the code".
- Specific labels: "Save menu", "Send reset link", not "Submit" or "Continue".
- Brand names, paths, codes and versions are wrapped in `translate="no"`.

## Headings and content

- One `h1` per view (the `PageHeader` or the sign-in title). A `Card` directly under it is `headingLevel={2}`; the default `3` skips a level there. `FormSection` titles are `h2`.
- Text in flex rows can shrink: `min-width: 0` with `overflow-wrap: anywhere` or an ellipsis that has the full text elsewhere.
- Plan for empty, short, average and very long values in every list, card and cell.

## Layout and touch

- Full-height surfaces use `dvh` after `vh` (audit `viewport-height`).
- The viewport never blocks zoom (audit `zoom-block`).
- No horizontal page scroll from 320 to 1440px; wide content scrolls in its own wrapper.
- A drag, swipe or pinch has a button or keyboard path too (`PanZoom` keys, `SortableList` keys).
- On a phone the top bar keeps at most four controls; move the rest into preferences or the account menu.

## Theme and locale

- `<meta name="theme-color">` follows the page background: set it from the computed `body` background after `applyTheme`.
- The theme control is an icon: `ThemeSwitch variant="icon"` in a top bar, `variant="icons"` in settings; words only where the three choices need explaining.
- Dates and numbers through `Intl` with the active locale; `lang` on `<html>` follows the chosen language.
- `document.title` names the page ("Menus · Acme console").

## Where xDev differs

| Web Interface Guidelines | xDev |
|---|---|
| Title Case for headings and buttons | sentence case everywhere |
| `outline-none` with a `ring-*` replacement | keep the library's 2px `--x-color-signal` outline; never remove it |
| Tailwind utilities (`truncate`, `size-*`, `h-dvh`) | tokens and library parts first; Tailwind v4 utilities only from `@xdev-asia/ui/tailwind.css` |
| `virtua` for lists over 50 items | `Pagination` first; virtualize only a list that must scroll as one |
| hover states on every control | the library draws them; app CSS adds none |
