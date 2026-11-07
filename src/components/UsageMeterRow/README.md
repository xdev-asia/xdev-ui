# UsageMeterRow

Row that shows how much of an account's quota is used in each time window, with the reset time and the account state. Built on `Meter` and `StatusDot`.

## Anatomy
`div.x-usage[data-state]` > `.x-usage-account` (name + `StatusDot` with word) + `ul.x-usage-windows` > `li` (`Meter` + `.x-usage-reset`) + `.x-usage-actions`.

## Props
`account`, `windows: { label, used, resetText }[]` (`used` is 0 to 100), `state: "ok" | "limited" | "error" | "signedOut"`, `warnAt?` (default 80), `actions?: ReactNode`, `labels?` (`state` words).

## Rules
- Each window is a `Meter`. At or above `warnAt` the fill and the percent take the warn tone; the percent text stays visible, so colour is not the only signal.
- The account state is a dot plus a word. `limited` is warn, `error` is danger, `signedOut` is neutral.
- `resetText` arrives formatted by the caller, so it follows the locale of the app.
- `actions` holds secondary or ghost Buttons. The row has no primary button.
- With no windows (signed out), only the account and its state render.
- Translate with `labels`; the defaults are English.
