# CodeBlock

Read-only snippet of a command or config with a language label and a copy button.

## Anatomy
`div.connect-snippet` > `.connect-head` (`.connect-lang`, `button.connect-copy[data-copy]`) + `div.connect-code` > `pre` > `code`.

## Rules
- For text the user copies and runs (an install command, an MCP config). Not a code viewer: no highlighting, no line numbers.
- The code is shown verbatim in `--font-mono` on `--x-color-bg`; long lines scroll inside the block, and the block takes keyboard focus so they can be scrolled without a mouse.
- The copy button appears only when `navigator.clipboard` exists, so it stays hidden in the server markup.
- After a copy the button reads `labels.copied` in `--ok` for 1.5s; the text change is announced politely.
- `CodeBlockLabels`: `copy`, `copied`.
- The copy button (`.connect-copy`) has a hit area of at least 24 x 24 px (an invisible `::before`; WCAG 2.5.8) without growing.
