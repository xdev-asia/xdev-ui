# ResourceCard

Card for one thing in a grid (a provider, an integration, a tool): its mark, its name, one status line, and one control beside it.

## Anatomy
`div.x-resource-card` > `a|button|div.x-resource-card-main` (`.x-resource-card-lead` + `.x-resource-card-text` > `.x-resource-card-title` + `.x-resource-card-status`) + `.x-resource-card-trail`. Put cards in a `Grid` (`minItemWidth="14rem"`).

## Rules
- Use it for things the user connects or opens, many of the same kind. A starting point for an action is an `ActionTile`; a row in a list is a `ListRow`.
- `leading` is an `Avatar` (initials when there is no logo), a logo image or an `Icon`, 32px.
- `status` says the state in words, with a `StatusDot` or a `Badge`: "2 connected", "No connections". Colour alone never carries it.
- The card opens the thing; `trailing` holds the one other control (a `Switch`). It sits outside the link, so it is never nested in it.
- `revealTrailing="hover"` hides the control until hover or keyboard focus; on touch screens it stays visible.
- `dimmed` is for a thing that is switched off. Hover and focus are a tint and a 1px accent border, never a coloured stripe.
