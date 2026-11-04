# Disclosure

Collapsible group with a sticky head, a count and optional actions, as in the changes list.

## Anatomy
`section.ws-group` > `div.ws-group-bar` (`button.ws-group-head[aria-expanded]` > `.ws-chevron`, `.ws-group-title`, `.ws-group-count`; then `.ws-group-actions`) + `div.ws-group-body`.

## Rules
- The whole head is one button; actions sit beside it, never inside it.
- Titles are short uppercase-styled nouns ("Staged", "Unstaged"); write them in sentence case, CSS sets the case.
- The chevron points down when open and turns -90deg when closed, with a reduced-motion fallback.
- Use `expanded` + `onToggle` to keep state outside (e.g. persisted per repo), or `defaultExpanded` for local state.
- Collapsed bodies use the `hidden` attribute, so their content leaves the tab order.
