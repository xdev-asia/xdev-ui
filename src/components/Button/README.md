# Button

Text button for the one or two decisive actions in a dialog, banner or toolbar.

## Variants
| variant | class | use |
|---|---|---|
| `primary` (default) | `.btn` | the single confirming action: accent fill, `--x-color-on-accent` text |
| `secondary` | `.btn-secondary` | cancel and every other action: transparent with a `--x-color-line` hairline |

## Rules
- One primary per surface. Put it last (right) in `.dialog-actions`.
- Labels are verbs in sentence case: "Create session", "Discard", not "OK" when a verb fits.
- `icon` takes an `Icon` name and sits before the label.
- Disabled buttons keep their place; never hide an action that becomes available later.
- Focus: the shared 2px `--x-color-signal` ring, offset 2px.

```js
h(XDev.Button, { onClick: save }, "Save")
h(XDev.Button, { variant: "secondary" }, "Cancel")
```
