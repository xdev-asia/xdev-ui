# FontField

Text input with a list of suggested font families, for the UI font setting. The name is shown in its own font. A close button clears it and returns to the default font.

## Rules
- Controlled: `value` is the family name, `onChange` gets the new name. Empty means the default font.
- Suggestions are hints, not a limit: any installed family can be typed. Turn the name into CSS with `fontStack` and `applyUiFont` from `theme`, which also drop characters that could end a declaration.
- Give it an `aria-label` or wrap it in a visible label; pass `labels.reset` in the app language.
- A choice of a few fixed options such as the theme: use `Segmented` or `Select`.
