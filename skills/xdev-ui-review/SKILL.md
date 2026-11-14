---
name: xdev-ui-review
description: "Audits a React app that uses @xdev-asia/ui, page by page. Use when committing UI work or asked to review UI there: a page, a whole app, a list or table, a dashboard, a settings page, a dialog or form, a sign-in page or a provider grid. Covers tokens instead of raw colours, px and font sizes, coloured left stripes, one primary button, sentence-case labels in en and vi, focus, accessible names, target size, reduced motion, forced colours, contrast, 360px layout, empty, loading and error states, destructive confirms, autofill and translated library labels."
license: Apache-2.0
---

# Review a UI built with @xdev-asia/ui

Run the script, fix every error, then walk the manual checklist and the check for each page type.

## 1. Run the audit

```bash
node <skill-dir>/scripts/audit.mjs src --i18n src/i18n
```

- `<skill-dir>` is where this skill is installed, e.g. `.claude/skills/xdev-ui-review`.
- `--i18n <dir>` compares `en.ts` and `vi.ts` in that folder.
- `--contrast` adds a WCAG contrast report for the theme token pairs (needs the manifest).
- `--manifest <path>` points at `ai-manifest.json` when `node_modules/@xdev-asia/ui/dist/ai-manifest.json` does not exist; without a manifest the `unknown-token` and `i18n-labels` rules are skipped with a note.
- Output is `file:line rule message`. Exit code 1 means at least one error; warnings never fail.

| rule | level | what it flags |
|---|---|---|
| `raw-colour` | error | `#hex`, `rgb(`, `hsl(`, `oklch(` in `.css`, `.ts`, `.tsx` |
| `raw-px` | error | a size in `px` other than `1px` in CSS or a `style` prop |
| `raw-font` | error | `font-size`, `fontSize`, or `font:` without `var(--type-*)` |
| `left-stripe` | error | `border-left`, `border-inline-start` with a width, or an inset left shadow |
| `unknown-token` | error | `var(--<name>)` that is not a design token or defined in the app |
| `focus-outline` | error | `outline: none`/`0` with no `:focus-visible` replacement for the same selector |
| `positive-tabindex` | error | `tabIndex` or `tabindex` above 0 |
| `icon-button-name` | error | a `button` whose only content is an unnamed icon, or a self-closing `Button` with `icon` and no name |
| `i18n-parity` | error | `en` and `vi` differ in keys, or a value is empty |
| `primary-count` | warn | more than one `Button variant="primary"` in one file |
| `label-voice` | warn | `!`, emoji, or Title Case Of Three Words in UI text |
| `target-size` | warn | a width or height under 24px on a control selector, with no 24px minimum |
| `reduced-motion` | warn | an animation whose keyframes move content, in a file with no `prefers-reduced-motion` query and no app-wide `*` guard |
| `fixed-width` | warn | `width` or `min-width` over 320px in CSS, with no `max-width` in `%`/`vw`/`min()` and not inside a `min-width` query |
| `nowrap` | warn | `white-space: nowrap` on a non-control with no `overflow` or `text-overflow` in the same rule |
| `forced-colors` | warn | the outline replaced only by `box-shadow` or border colour, with no `forced-colors` rule in the file |
| `sign-in-shell` | warn | an `AuthShell` with no `headline`, `actions` or `footer`, inline `actions` with no `ThemeSwitch`, a heading as the headline, or more than one `h1` in its file |
| `list-empty` | warn | a `DataTable` with no `empty` |
| `confirm-dialog` | warn | a destructive `Dialog` (`alert` or `tone="danger"`) that is not `modal`, has no `alert`, or has no `busy` or `confirmDisabled` |
| `form-busy` | warn | a `FormDialog` with no `busy` |
| `autocomplete` | warn | a `password`, `email` or `tel` field or input with no `autoComplete` |
| `img-alt` | error | an `img` with no `alt` |
| `stat-delta` | warn | a `StatTile` with a `delta` and no `hint` naming what it is compared with |
| `resource-face` | warn | a `ResourceCard` with no `leading`, or an `Avatar` or `img` as its face |
| `i18n-labels` | warn | a library part that takes `labels` used without them, so its built-in words stay English; only with `--i18n` and a manifest |
| `contrast` | error or warn | a token pair below 4.5:1 (text) or 3:1 (UI parts); only with `--contrast` |

## 2. Fix, do not silence

- Colour, size, type: replace the literal with a token. Find it with `xdevui_search_tokens` (see `references/grep-recipes.md`).
- Stripe: use a tint, a 1px border or a `StatusDot`.
- Do not delete the audit rule or the line to make it pass; do not add `outline: none`.

## 3. Check by hand

Work through `references/checklist.md`: 375, 768 and 1440px widths (and 320px for overflow), dark and light, `en` and `vi`, keyboard order, focus ring, empty, loading and error states, destructive actions.

Then run the check for each page's type. A page can be more than one type (a list that opens a dialog gets both checks).

| the page | check |
|---|---|
| a `DataTable`, `List` or `ResourceList` of records | `references/pages/list.md` |
| totals (`StatTile`) and charts over a period | `references/pages/dashboard.md` |
| `SettingRow`s or a `SettingsShell` | `references/pages/settings.md` |
| a `Dialog`, `FormDialog`, `Drawer` or a form of `Field`s | `references/pages/dialogs-forms.md` |
| `AuthShell`, or a step of signing in (code, consent, hand-off, link landing) | `references/pages/sign-in.md` |
| cards of providers, models, tools, integrations or apps | `references/pages/provider-grid.md` |

Then check each widget against its APG keyboard and ARIA contract and walk the heuristics checklist from the `xdev-ui-ux-standards` skill. It gives each audit rule its WCAG or platform source.

## 4. Review a whole app

When asked to review every page or every feature:

1. List the routes from the router file or the nav items, one row per page, including dialogs a page opens and the sign-in steps. With neither, use one row per page file and write `unknown` as the route.
2. Give each row its page types from the table above.
3. Run the audit once over the source folder and file each finding under the row of the file and line it points at; a part shared by a page and its dialog goes under the page.
4. For each page, open it in the running app and walk its page checks. With no running app, decide what the source shows and put the rest under "not run".
5. Report one table. "passed" and "failed" count the items of that page's checks in `references/pages/`; an item that does not apply goes under "not run" as `n/a`:

```
| page | route | types | audit | passed | failed | not run |
|---|---|---|---|---|---|---|
| Users | /users | list, dialogs-forms | 0 errors, 1 warn | 9 | 1: row actions all say "Delete" | 360px: no device |
```

## 5. Report

List what you fixed and what is left. Say which manual checks you did not run; do not claim them.
