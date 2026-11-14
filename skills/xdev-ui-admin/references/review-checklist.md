# Review checklist

Run before calling a screen done, then run the `xdev-ui-review` skill (`scripts/audit.mjs`).

## Contents
- Structure
- States
- Forms
- Lists
- Language and access
- Code

## Structure
- [ ] One `PageHeader`, one `h1`, one primary button per view (page, dialog, drawer).
- [ ] Works at 375, 768 and 1440px (and 320px): no horizontal page scroll, actions wrap, tables scroll inside their wrapper with actions `sticky="end"` or use `stack`; screenshot at 375 too.
- [ ] Layout uses `Container`, `Stack`, `Grid` or theme utilities; no px, no raw colours, no numeric z-index.

## States
- [ ] Loading (skeleton matching the shape), error (Banner + Try again), empty (no data / no match) all render and are tested.
- [ ] Buttons show `busy` and cannot double-submit.

## Forms
- [ ] Right container (FormDialog up to 5 fields, Drawer, page + SaveBar).
- [ ] Validation is a pure, tested function; messages on the fields; values kept on failure.
- [ ] Leaving a dirty form asks (`useUnsavedGuard`, `confirmLeave`).
- [ ] Dates are ISO strings; uploads lock Save while busy.

## Lists
- [ ] Search, filters, sort and page live in the URL; filters reset page to 1.
- [ ] Facets with counts (`FilterChip` or `FacetFilter`); selection shows a `BulkBar`; destructive bulk actions confirm with the count.
- [ ] Reorder only for manually ordered lists, disabled while sorted.

## Language and access
- [ ] Sentence case, verbs on buttons, no emoji or exclamation marks; `en` and `vi` for every string and every component `labels`.
- [ ] Every control labelled; colour never the only signal; focus returns to the trigger after overlays.
- [ ] Hidden vs disabled actions follow the role; the server checks again.

## Code
- [ ] Pure `XView` + data-loading `XPage`; views tested with `renderToStaticMarkup`.
- [ ] Filtering, sorting, CSV and validation are pure functions with unit tests.
