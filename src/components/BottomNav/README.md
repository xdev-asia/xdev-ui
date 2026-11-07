Tab bar fixed at the bottom of a phone screen: up to five destinations with icon, label and an optional count, and a "more" tab that opens the rest in a bottom sheet.

## Anatomy
`nav.x-bottom-nav[aria-label]` > `button.x-bottom-nav-item[aria-current]` (`.x-bottom-nav-icon` with icon and `.x-bottom-nav-badge`, `.x-bottom-nav-label`). With `more`: a last `button[aria-haspopup=dialog][aria-expanded]` and, while open, a `Drawer` with `side="bottom"` that lists `more.items`.

## Rules
- Use it for the main destinations below 768px. The bar hides itself from 768px up; keep the same destinations in the sidebar. Pass it to `AppShell` as `bottomNav`.
- 5 tabs at most. With `more`, the bar keeps the first 4 `items` and `more` is the fifth; extra `items` are dropped, so move them into `more.items`.
- The current tab has `aria-current="page"` and a tint. If the current id is in `more.items`, the "more" tab is tinted instead.
- The bar is 60px high; each tab is at least 48px tall and a fifth of the width, so it works at 360px.
- `badge` is a count. It shows as a number in a 1px border, `99+` above 99, and is spoken as `labels.badge(n)` ("3 new"). The "more" tab shows the sum of the counts in the sheet.
- The sheet is the `Drawer`: focus moves in, Tab stays inside, Escape, the close button and the backdrop close it, and focus returns to the "more" tab. Choosing a destination calls `onChange` and closes it.
- `moreOpen` and `onMoreOpenChange` control the sheet when the page needs to; without them the component keeps the state.
- Labels are short nouns in sentence case. Do not show state by colour alone.
- `labels.nav` and `labels.badge` translate the strings; item labels come from the caller.
