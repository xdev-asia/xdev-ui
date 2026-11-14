# Button

Text button for the one or two decisive actions in a dialog, banner or toolbar.

## Variants
| variant | class | use |
|---|---|---|
| `primary` | `.btn` | the single confirming action: accent fill, `--x-color-on-accent` text |
| `secondary` (default) | `.btn-secondary` | cancel and every other action: transparent with a `--x-color-line` hairline |
| `danger` | `.btn-danger` | the confirming action of a destructive step (delete, revoke): `--x-color-danger-soft` tint, danger text and border |
| `ghost` | `.btn-ghost` | low-weight actions in toolbars and table rows: no border until hover |
| `link` | `.btn-link` | an action that reads as inline text: accent colour, underlined |

`size="sm"` (`data-size="sm"`) is the compact size for tables and toolbars; `md` is the default.

`href` renders an `<a>` with the same classes (pass any anchor prop: `target`, `rel`, `download`). A disabled link drops
`href`, sets `aria-disabled="true"` and ignores clicks. For client-side routing wrap the router's link instead
(for example `<Link className="btn-secondary">`). `ref` is a plain prop (React 19), typed to the rendered element.

## Rules
- The default is `secondary` (since 2.5.0). Pass `variant="primary"` on the one main action of a surface.
- One primary per surface. Put it last (right) in `.dialog-actions`. For a destructive step `danger` takes the primary's place.
- Labels are verbs in sentence case: "Create session", "Discard", not "OK" when a verb fits.
- `icon` takes an `Icon` name and sits before the label.
- Disabled buttons keep their place; never hide an action that becomes available later.
- Focus: the shared 2px `--x-color-signal` ring, offset 2px.

```js
h(XDev.Button, { variant: "primary", onClick: save }, "Save")
h(XDev.Button, { variant: "secondary" }, "Cancel")
h(XDev.Button, { variant: "danger" }, "Delete user")
h(XDev.Button, { href: "/docs", variant: "link" }, "Read the docs")
```

## Responsive
- The label stays on one line; the row around the button wraps instead. On a touch screen buttons are at least 44px high.
