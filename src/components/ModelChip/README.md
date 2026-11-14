# ModelChip

Chip for one model in a provider's list: a `bot` mark, the id clients send in a mono pill with a Copy button beside it, and the display name with small actions (hide, test, remove) under it. `ModelChipAdd` is the dashed chip that ends the list and adds a model.

## Anatomy
`div.x-model-chip` > `.x-model-chip-lead` + `.x-model-chip-body` > `.x-model-chip-line` (`code.x-model-chip-code` + `codeAction`) + `.x-model-chip-line` (`.x-model-chip-name` + `.x-model-chip-actions`). Chips wrap in a row: put them in a `Stack direction="row" wrap`. `button.x-model-chip.x-model-chip-add` holds a `plus` icon and the label.

## Rules
- `code` is the exact id a client sends (with the provider prefix), so Copy copies it unchanged. Long ids are cut with an ellipsis and keep the full id in `title`.
- `codeAction` and `actions` are `IconButton size="sm"`, each with a `label`. Put Copy beside the pill; Hide or Show, Test and Remove beside the name.
- `dimmed` is for a model the owner turned off. The Show button stays at full strength so it can be turned back on.
- State is a tint or a 1px border, never a coloured stripe. `ModelChipAdd` has a dashed 1px border and goes last.
- A test result is a toast or the button's icon (`check`, `alert`), not a colour on the whole chip.
