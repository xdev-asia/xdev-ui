# FileIcon

Picks the line icon and colour for a file or folder from its name: extension, well-known file names (`package.json`, `Dockerfile`, `.gitignore`, `README.md`) and well-known folders (`src`, `.git`, `node_modules`, `assets`, `tests`).

## Rules
- Use it wherever a row shows a file name: tree views, tabs, search results, diffs. `TreeView` uses it already.
- Put the file name next to it; pass `label` only when the icon stands alone.
- Colour comes from the tone (`data-tone`), mapped to theme tokens in `brand.css`. Do not recolour per language; one tone per family keeps a long tree calm.
- Folders stay muted and turn `--signal` when open, like the tree row.
- `fileIcon(name, kind, open)` returns `{ icon, tone }` without rendering, for lists that draw their own glyph.
- An unknown extension falls back to `file` with the plain tone.

## Tones
| Tone | Token | Files |
| --- | --- | --- |
| code | `--accent` | ts, tsx, js, py, go, rs, java, c, cpp, vue, svelte, diff |
| markup | `--orange` | html, xml |
| style | `--violet` | css, scss, less |
| data | `--warn` | json, csv, sql, package.json, Cargo.toml |
| doc | `--text-2` | md, txt, pdf, README, LICENSE |
| media, shell, test | `--ok` | images, audio, video, sh, ps1, Makefile, *.test.ts |
| config, plain | `--text-3` | yaml, toml, lock files, .env, .gitignore, archives |
| folder, folder-open | `--text-3`, `--signal` | folders |
