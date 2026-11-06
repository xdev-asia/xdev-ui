# ThemePreview

A small card of sample surface, text, hint, a neutral button look and three status dots, painted by the tokens of one mode.

## Anatomy
`section.x-theme-preview[data-theme]` > `h5` + two `p` + `.x-theme-preview-row` (`.x-theme-preview-button` and three `StatusDot`s: ok, warn, danger).

## Rules
- `mode` ("dark" or "light") becomes the card's own `data-theme`, so a theme's overrides for that mode show without switching the page.
- The button look is a `span`, not a control: it is not focusable and does nothing.
- `title`, `sample`, `hint` and `button` are all props; the component has no text of its own.
- The dots are `StatusDot` with `tone` ok, warn and danger and carry no text; the card is for a sighted check of colours.

## CSS classes
`.x-theme-preview`, `.x-theme-preview-title`, `.x-theme-preview-text`, `.x-theme-preview-hint`, `.x-theme-preview-row`, `.x-theme-preview-button`.
