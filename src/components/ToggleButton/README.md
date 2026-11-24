# ToggleButton

Button that turns one option on or off, such as granting one permission, with an optional warning tone.

## Anatomy
`button.x-toggle[aria-pressed][data-size]` (plus `[data-tone=warning]`) > `svg.x-toggle-check` (decorative, shown only while pressed) + `.x-toggle-label`. Extra props (`title`, `data-*`, `disabled`, `aria-describedby`) land on the button.

## Rules
- Use it for an option that is set, not for a filter over a list (`FilterChip`) and not for one of a few views (`Segmented`, `Tabs`). For a setting that applies at once, prefer `Switch`.
- Native `<button aria-pressed>`: click, Space and Enter toggle it; `onPressedChange(next)` gets the new value. `onClick` still runs first, and `preventDefault()` in it cancels the change.
- Pressed is a tint, a 1px accent border and a check mark, so the state does not rest on colour alone. Never a solid fill or a left stripe.
- `tone="warning"` adds a warn-coloured border in both states. It must come with text that says why (a `Badge`, the label, or a `title` plus visible text); colour alone is not the message.
- The label is the option itself ("Delete apps", a permission code), not "On"/"Off": screen readers already say pressed or not pressed.
- Focus shows the `--x-color-focus` ring. A disabled toggle keeps its pressed look at reduced opacity.
- Put a group of toggles in a row with `flex-wrap`; each toggle is independent.
