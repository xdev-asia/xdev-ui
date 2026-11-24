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
(for example `<Link className="btn-secondary">`), or pass `renderLink` and spread the props it gets on the router link:
`renderLink={(p) => <Link {...p} />}` (Next.js). It gets `href`, `className`, `data-size`, `onClick`, `children`, `ref`
and every other anchor prop (`target`, `rel`, `aria-*`). While the link is `disabled` or `busy`, `renderLink` is not
called: the plain `<a>` without `href` renders instead. `ref` is a plain prop (React 19), typed to the rendered element.

`busy` marks async work in flight: a small `Spinner` takes the leading icon's place, `aria-busy="true"` is set and the
control stops taking clicks (`disabled` on a `<button>`, the disabled-link behaviour on an `href`). The label stays, and
the spinner is hidden from assistive tech, so the accessible name does not change. `iconEnd` puts an icon after the label.

## Rules
- The default is `secondary` (since 2.5.0). Pass `variant="primary"` on the one main action of a surface.
- One primary per surface. Put it last (right) in `.dialog-actions`. For a destructive step `danger` takes the primary's place.
- Labels are verbs in sentence case: "Create session", "Discard", not "OK" when a verb fits.
- `icon` takes an `Icon` name and sits before the label.
- `busy` is for an async submit: the first click starts the work and sets `busy` until it settles (success or error);
  the button takes no second click meanwhile. Keep the label as is (no "Saving..." swap) and give the button an `icon`
  so the spinner reuses its box and the width does not jump. A page or table load is a `Spinner` or `Skeleton`, not a busy button.
- `iconEnd` is a navigation or disclosure cue only: `chevron` for a disclosure, `chevron-right` for "next", `external`
  for a link that leaves the app. It is never a second action; a separate action is a separate button.
- Disabled buttons keep their place; never hide an action that becomes available later.
- Focus: the shared 2px `--x-color-signal` ring, offset 2px.

```js
h(XDev.Button, { variant: "primary", onClick: save }, "Save")
h(XDev.Button, { variant: "secondary" }, "Cancel")
h(XDev.Button, { variant: "danger" }, "Delete user")
h(XDev.Button, { href: "/docs", variant: "link" }, "Read the docs")
h(XDev.Button, { variant: "primary", icon: "save", busy: saving, onClick: save }, "Save")
h(XDev.Button, { href: "https://example.org", target: "_blank", iconEnd: "external" }, "Open status page")
```

## Responsive
- The label stays on one line; the row around the button wraps instead. On a touch screen buttons are at least 44px high.
