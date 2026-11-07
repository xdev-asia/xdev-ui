# StatusBar

26px footer bar (`--h-footer`) for session counts, meters and the current branch.

## Rules
- `items` renders left to right; the string `"spacer"` pushes the rest to the right.
- Left: session counts. Right: meters, branch, encoding.
- Text is 11px `--text-2`. Nothing here is a primary action.
- `hidden` renders nothing (the bar leaves the layout); absent or `false` renders as before.
