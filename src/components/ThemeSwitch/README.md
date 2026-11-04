# ThemeSwitch

System, Dark and Light as one segmented control; the app stores the choice and sets `data-theme` with the helpers from `theme`.

## Rules
- Controlled only: `value` is a `ThemePreference` and `onChange` gets the new one.
- Order is System, Dark, Light. Built on `Segmented`, so it has the same classes and `aria-pressed` segments.
- Text comes from `labels` (`group`, `system`, `dark`, `light`); the defaults are English. Ship `en` and `vi`.
- It does not touch the DOM. Call `resolveTheme` and `applyTheme` yourself, and `watchSystemTheme` while the value is `system`.
- Code that reads colours from JS (a terminal, a canvas) re-reads them in `onThemeChange` with `readThemeColors`.
