# Page check: provider grid

**This page is a provider grid when** it shows things (providers, models, tools, integrations, apps) as cards or rows that a person picks, turns on or opens. People are a list (`list.md`) with `Avatar`.

Source rules: `xdev-ui-admin/references/visual-identity.md`, `resource-list.md`.

## Auto (audit.mjs)
- `resource-face`: a `ResourceCard` with no `leading`, or with an `Avatar` or `img` as its face.
- `img-alt`: an `img` with no `alt`.
- `i18n-labels` (with `--i18n`): a `SearchInput` or `FacetFilter` with no `labels`.

## By hand
- [ ] **Face.** Each thing leads with an `Emblem` (its logo on a plate that works in both themes, or its own letters and colour). It never uses a generic icon or grey initials. `Avatar` is only for people.
- [ ] **Count heading.** Above each grid is a heading with how many things it holds ("Providers · 12").
- [ ] **State.** On or off is a `StatusDot` with words from the strings files. A switched-off card is `dimmed`. Colour is never the only cue.
- [ ] **Four states.** Loading shows skeleton cards. An error shows a `Banner` with "Try again". Empty shows an `EmptyState` with the next step. A search with no results names the query.
- [ ] **Container.** The page sits in a `Container`. At 1440px cards do not stretch edge to edge. At 360px they fall to one column with no sideways scroll.
- [ ] **Card actions.** A whole-card link (`href` or `onClick`) has one name. Extra actions are in `trailing` and still reachable by keyboard (`revealTrailing` shows them on focus too).
- [ ] **Search** filters as the person types. The query is in the URL, and the count updates and is read out.
