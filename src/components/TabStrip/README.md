# TabStrip

Horizontal strip of terminal-session tabs with state, agent, colour and close control.

## Anatomy
`.ws-tabstrip[data-variant]` > `.ws-tab[draggable][data-drop]` > `.ws-tab-main` (StatusDot, AgentChip, Icon, `.ws-tab-name`, optional `.ws-tab-skip`) + `.ws-tab-close` or `.ws-tab-dirty`; `.ws-tab-add` ends the strip.

## Rules
- `color` 1–10 picks `--x-tab-color-N` for the selected underline and the menu swatch. Colours 5, 7 and 9 are `color-mix` blends defined in bundle.css.
- `unread` marks output the user has not seen; it clears on select.
- `dirty` replaces the close button with a dot, so a click cannot discard work.
- `pinned` drops the close button and ignores Delete, for a tab that must stay (a console's home page).
- Names are the session or branch name, never "Terminal 1".
- `icon` puts a 14px glyph before the name (the page's menu icon in a console).
- `variant`: `chrome` (default, joined tabs), `card` (separate boxes), `plain` (text with an accent underline), `brisk` (a soft accent pill on the selected tab).
- `onReorder` makes unpinned tabs draggable and lets Shift+Left/Right move the focused tab; it receives every id in the new order. Pinned tabs stay first and nothing moves past them. `moveTab(ids, id, to, pinned)` is the pure helper behind both.
- `labels` (`TabStripLabels`: `skipped`, `unsaved`, `newTab`, `close(name)`) overrides the English defaults.

## Responsive
- The strip scrolls sideways inside itself at every width when the tabs do not fit; tabs keep their width.
