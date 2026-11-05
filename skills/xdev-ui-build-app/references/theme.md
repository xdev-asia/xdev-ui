# Theme

```ts
import { applyTheme, resolveTheme, systemPrefersDark, watchSystemTheme, type ThemePreference } from "@xdev-asia/ui";
```

- `ThemeSwitch` is controlled: `value` is a `ThemePreference` (`system`, `dark`, `light`) and `onChange` gets the new one.
- `resolveTheme(pref, prefersDark)` returns `dark` or `light`; `applyTheme(document.documentElement, theme)` sets `data-theme`.
- While the preference is `system`, call `watchSystemTheme` and re-apply on change; return its cleanup from the effect.
- Store the choice in `localStorage` inside try/catch, and read it after mount so server and client markup match.
- Check every screen in both themes. Never branch on the theme in CSS with a colour; the tokens already differ per theme.
