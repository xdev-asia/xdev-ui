# Rule catalogue

Each rule has an ID, what to do, why, and how to check it. "(audit)" means `scripts/audit.mjs` in `xdev-ui-review` reports it; the rule name follows.

## Contents
- 1 Accessibility
- 2 Interaction and focus
- 3 Tokens and colour
- 4 Brand
- 5 Layout and responsive
- 6 States and feedback
- 7 Typography
- 8 Navigation and information
- 9 Motion
- 10 Data display

## 1 Accessibility
CRITICAL. A screen that some people cannot use is not done, however it looks.

| ID | do | why | check |
|---|---|---|---|
| `a11y-contrast` | text 4.5:1, large text and UI parts 3:1, in both themes | WCAG 2.2 SC 1.4.3 and 1.4.11 | (audit `contrast` with `--contrast`) |
| `a11y-not-colour-alone` | pair every colour signal with words or a shape | colour-blind users, forced colours | look for a dot or tint with no label |
| `a11y-icon-name` | icon-only controls are `IconButton` with a `label` | screen readers read nothing otherwise | (audit `icon-button-name`) |
| `a11y-focus-visible` | keep the library focus ring; never remove `outline` without a `:focus-visible` replacement | keyboard users lose their place | (audit `focus-outline`) |
| `a11y-forced-colors` | draw focus and selection with outline or border, not only shadow or background | Windows high contrast drops paint | (audit `forced-colors`) |
| `a11y-landmarks` | one `main` (the shell gives it), headings in order, skip link first | navigation by landmark and heading | tab once from the top: skip link |
| `a11y-lang` | `lang` on `<html>` follows the chosen language | correct voice and hyphenation | switch `vi` and inspect |

## 2 Interaction and focus
CRITICAL. People must reach and trigger every action without guessing.

| ID | do | why | check |
|---|---|---|---|
| `int-target-size` | controls at least 24px, rows `--h-row` or taller | WCAG SC 2.5.8 | (audit `target-size`) |
| `int-one-primary` | one primary `Button` per surface; the rest `secondary` or `ghost` | the eye needs one next step | (audit `primary-count`) |
| `int-keyboard-path` | tab order follows reading order; no positive `tabIndex` | predictable focus | (audit `positive-tabindex`), then tab through |
| `int-no-hover-only` | an action shown only on hover (`revealTrailing="hover"`) also shows on focus and on touch | keyboard and touch have no hover | tab to the card; try at 360px |
| `int-confirm-destructive` | delete and revoke confirm in a `Dialog` with `alert`; the title names the object | no undo for loss | read the dialog title |
| `int-disabled-reason` | a disabled control says why next to it, not in a `Tooltip` | disabled controls get no focus | look for the reason text |

## 3 Tokens and colour
HIGH. Tokens keep every screen in both themes and every app in one family.

| ID | do | why | check |
|---|---|---|---|
| `tok-no-literal` | no hex, `rgb()`, raw `px` (except 1px hairlines) or raw font in app CSS | literals break the light theme | (audit `raw-colour`, `raw-px`, `raw-font`, `unknown-token`) |
| `tok-semantic-role` | pick a token by its role (`tokens.md`): text on `--text-1`, secondary on `--text-2` | values change, roles do not | read the selector and the token side by side |
| `tok-one-accent` | `--accent` is the only brand colour in the UI | two accents compete for the next step | count blue things on screen |
| `tok-signal-is-focus` | cyan `--signal` is the focus ring and nothing else | focus must stand out | search app CSS for `--signal` |
| `tok-hairline-not-shadow` | separate regions with 1px `--line`; shadows only on floating layers | flat, calm surfaces | look for `box-shadow` in app CSS |
| `tok-tint-not-fill` | state backgrounds use the soft tints (`--ok-bg`, `--warn-bg`, `--danger-bg`) | full fills shout and fail contrast | look for solid state fills |
| `tok-both-themes` | check every new colour pair in dark and light | light values differ from dark ones | screenshots in both |

## 4 Brand
HIGH. The logo is the one place where xDev's own colours appear. Rules in `brand.md`.

| ID | do | why | check |
|---|---|---|---|
| `brand-mark-v9` | use `BrandMark` from the library, `variant="mark"` in app chrome | one logo, one source | grep for `<svg` logos in the app |
| `brand-agent-cursor` | the cursor stays `--brand-agent` in both themes | it is the mark's signature | screenshot both themes |
| `brand-clear-space` | at least half the mark's height around it | crowded marks read as clutter | measure in the screenshot |
| `brand-no-redraw` | never recolour the tile, outline the mark or change the wordmark face | consistency across products | compare with `assets/brand` |
| `brand-app-name` | the app name sits beside the mark in text, in the body face, weight 600 or 700 | a name is read, a logo is seen | read the header |

## 5 Layout and responsive
HIGH. Structure first, then colour.

| ID | do | why | check |
|---|---|---|---|
| `lay-container` | one `Container` per page: `xl` for lists and dashboards, `md` for forms | edge-to-edge content looks unfinished | 1440px screenshot |
| `lay-space-scale` | gaps and padding from `--x-space-1` to `--x-space-8` (4px steps) | rhythm | (audit `raw-px`) |
| `lay-radius-scale` | radius from `--radius-s`, `--radius-m`, `--radius-l` (or `--x-radius-sm` to `--x-radius-lg` on semantic surfaces) | one corner language | look for odd corners |
| `lay-360` | no horizontal page scroll at 360px; tables scroll inside themselves | phones and split windows | 360px screenshot |
| `lay-control-width` | header controls are as wide as their content | stretched tabs look broken | 1440px screenshot |
| `lay-top-bar-surface` | the top bar has the page's surface and no rule under it until the page scrolls | a lighter band with a border reads as a separate box; cut-off cards show their corners | read `.x-shell-top` background and border at scroll 0 and after |
| `lay-shell` | console apps use `AppShell`; public pages use `SiteShell` | one frame per kind of app | read the root component |

## 6 States and feedback
HIGH. A region is not done until each state has a design.

| ID | do | why | check |
|---|---|---|---|
| `st-empty-next-step` | `EmptyState` names what to do next; an empty search names the query | a blank region is a dead end | clear the data |
| `st-loading-per-region` | one `Spinner` per region, `DataTable loading`, `StatTile loading`, `Skeleton` for layout | many spinners look broken | throttle the network |
| `st-error-retry` | a failed load shows a `Banner` with `tone="danger"` and a retry action | users need a way out | block the API |
| `st-toast-past-tense` | success is a `Toast` in past tense ("Provider added") | it confirms what happened | do the action |
| `st-keep-input` | a failed save keeps everything the user typed | retyping is the worst error | fail a save |

## 7 Typography
MEDIUM. Two faces, a fixed scale of roles.

| ID | do | why | check |
|---|---|---|---|
| `type-token-only` | `font: var(--type-*)`; never a raw size | the scale stays coherent | (audit `raw-font`) |
| `type-two-faces` | Be Vietnam Pro for text, JetBrains Mono for code, IDs and numbers | Vietnamese diacritics, tabular digits | inspect computed fonts |
| `type-scale-roles` | pick by role: page title, heading, body, control, label, status (`tokens.md`) | sizes mean things | one page title per page |
| `type-mono-data` | keys, hashes, model IDs, counts in `--type-mono` or `--type-stat` | digits line up | read a table column |
| `type-sentence-case` | sentence case labels; uppercase only through `--type-section` | calm and readable | (audit `label-voice`) |

## 8 Navigation and information
MEDIUM. People must always know where they are and how much there is.

| ID | do | why | check |
|---|---|---|---|
| `nav-current-accent` | the current nav item and tab use the accent; nothing else in the nav does | one "you are here" | look at the sidebar |
| `nav-page-title` | each page has a `PageHeader` title; the shell title follows it | orientation and the browser tab | change page |
| `nav-count-heading` | a heading and a count above every grid or list | a wall of cards has no shape | read above the grid |
| `nav-one-system` | one primary navigation (sidebar or `BottomNav` on phones), not tabs that duplicate it | two systems confuse | compare nav and tabs |

## 9 Motion
MEDIUM. Motion confirms; it never carries meaning on its own.

| ID | do | why | check |
|---|---|---|---|
| `mot-short` | only short positional transitions (about 0.12s); other state changes are instant | the tool feels immediate | read transitions |
| `mot-transform-only` | animate `transform` and `opacity`, not layout | smooth and cheap | read transitions |
| `mot-reduced` | wrap movement in a `prefers-reduced-motion` guard | vestibular disorders | (audit `reduced-motion`) |
| `mot-pulse-working-only` | only the working `StatusDot` pulses, and not under reduced motion | a pulse means "busy" | look for other loops |

## 10 Data display
LOW in count, high in how finished a screen looks. See also `references/visual-identity.md` in `xdev-ui-admin`.

| ID | do | why | check |
|---|---|---|---|
| `data-status-words` | `StatusDot` with a `label`, or a `Badge`; never a colour alone | readable at a glance and by screen readers | read every status |
| `data-emblem-face` | each thing leads with an `Emblem` (logo `src`, else `text` and `color`); `Avatar` is for people | things become recognisable | look for repeated grey circles |
| `data-no-left-stripe` | no coloured left stripe on a rounded card or row; use a tint, a 1px border or a dot | house rule; stripes read as alerts | (audit `left-stripe`) |
| `data-dimmed-off` | a switched-off thing is `dimmed`, not recoloured | colour stays for state | toggle one off |
| `data-mono-numbers` | numbers right-aligned in tables, in mono | comparison down a column | read a numeric column |
