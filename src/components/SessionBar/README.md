# SessionBar

Strip above the terminal that says what the session is doing: state, model, elapsed time, diff size and the actions of the session.

## Anatomy
`div.x-sessionbar[role=group]` > `.x-sessionbar-status` (`StatusDot` + word) + `.x-sessionbar-item` (model, elapsed) + `DiffStat` + `.x-sessionbar-actions`.

## Props
`status: SessionState`, `model?`, `elapsed?` (ms), `diff?: { add, del }`, `actions?: ReactNode`, `labels?` (`region`, `status` per state, `model`, `elapsed`, `duration(ms)`, `diffStat`).

## Rules
- The state is a dot plus a word, never colour alone. `working` pulses; the pulse stops under reduced motion.
- Parts that are not given do not render; nothing is reserved.
- `actions` holds IconButtons or secondary Buttons. The primary action of a surface lives in the panel or the `ApprovalBar`, not here.
- The bar wraps onto a second line on narrow screens instead of scrolling or truncating the state.
- Pass `elapsed` from a timer owned by the caller; the bar does not tick.
- Translate with `labels`; the defaults are English.
