# CommandPalette

Keyboard-first search across sessions, files and commands (Ctrl+K).

## Rules
- Filter chips narrow by kind; "All" first.
- Rows: leading StatusDot for sessions or an Icon for others, title with the match in `.pal-hit`, muted detail on the right.
- The first visible row is selected; ↑↓ move, Enter opens, Esc closes. The footer states this with `Kbd`.
- Empty result: "No matches", never a blank list.
- The bundle filters by substring for the preview; the app supplies its own ranking.
