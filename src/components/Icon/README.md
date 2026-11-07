# Icon

Line icon set on a 24 grid: 1.75 stroke, round caps and joins, `currentColor`.

## Rules
- Size 16 in controls, 20 in banners, 22 in the activity bar. Stroke stays 1.75 at every size.
- Colour comes from the parent's `color`; never fill an icon.
- Decorative by default (`aria-hidden`). Pass `label` only when the icon stands alone without a text label nearby; `IconButton` handles that case.
- New icons: draw on the 24 grid with 2px padding, outline strokes only, and match the existing corner radii (rx 1–2).
- The icon is sized by its `width`/`height` attributes (`size`), so a parent CSS rule can still resize it.
- Names are grouped in `src/icons.ts`: activity bar (`docs changes tasks squads agents kit accounts terminal`), arrows and window, actions, state and feedback, objects, git, folders (`folder folder-open folder-code folder-git folder-package folder-image folder-test folder-config folder-plus`) and files (`file file-code file-text file-info file-json file-data file-style file-image file-media file-config file-lock file-key file-terminal file-git file-package file-zip file-check file-diff file-plus`). The full list is `ICON_NAMES` (MCP: `xdevui_list_icons`).
- For a file or folder row, use `FileIcon`: it picks the icon and tone from the name.
- Shell icons: `board` (kanban columns), `automation` (loop with a play mark), `panel-right` (right-docked panel), `split` (two panes), `inbox`, `zap` (bolt).
