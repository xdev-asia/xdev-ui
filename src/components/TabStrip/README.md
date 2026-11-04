# TabStrip

Horizontal strip of terminal-session tabs with state, agent, colour and close control.

## Anatomy
`.ws-tab` > `.ws-tab-main` (StatusDot, AgentChip, `.ws-tab-name`, optional `.ws-tab-skip`) + `.ws-tab-close` or `.ws-tab-dirty`; `.ws-tab-add` ends the strip.

## Rules
- `color` 1–10 picks `--x-tab-color-N` for the selected underline and the menu swatch. Colours 5, 7 and 9 are `color-mix` blends defined in bundle.css.
- `unread` marks output the user has not seen; it clears on select.
- `dirty` replaces the close button with a dot, so a click cannot discard work.
- Names are the session or branch name, never "Terminal 1".
- `labels` (`TabStripLabels`: `skipped`, `unsaved`, `newTab`, `close(name)`) overrides the English defaults.
