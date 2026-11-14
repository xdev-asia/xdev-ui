# ThemeSwitch

System, Dark and Light as one segmented control, or (`variant="icon"`) one round button that flips dark and light, as in a top bar; the app stores the choice and sets `data-theme` with the helpers from `theme`.

## Rules
- Controlled only: `value` is a `ThemePreference` and `onChange` gets the new one.
- Order is System, Dark, Light. Built on `Segmented`, so it has the same classes and `aria-pressed` segments.
- `variant="icon"` shows the sun on a dark page and the moon on a light one; its label says what a click does (`toLight`, `toDark`). Pass `resolved` while `value` is `system`. It cannot pick System, so keep System in a menu (the account or ⋯ menu).
- In a titled `AppShell` top bar the icon button is 40px and round, like the other header icon buttons.
- Text comes from `labels` (`group`, `system`, `dark`, `light`, `toDark`, `toLight`); the defaults are English. Ship `en` and `vi`.
- `disabled` turns off all three segments (they get `disabled` and the dimmed look).
- It does not touch the DOM. Call `resolveTheme` and `applyTheme` yourself, and `watchSystemTheme` while the value is `system`.
- Code that reads colours from JS (a terminal, a canvas) re-reads them in `onThemeChange` with `readThemeColors`.
