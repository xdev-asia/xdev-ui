# Badge

Small tinted label for a state word: a file or kit item's sync status (`status`), or a record's state such as active, draft, failed, pending or internal (`tone`).

## Status map
| status | ground | text | meaning |
|---|---|---|---|
| `new` | `--x-color-ok-soft` | `--x-color-ok` | not in the target yet |
| `changed` | `--x-color-signal-soft` | `--x-color-signal` | differs from the target |
| `unchanged` | `--x-color-surface-2` | `--x-color-muted` | identical |
| `foreign` | `--x-color-warn-soft` | `--x-color-warn` | owned by something else; will not be touched |

## Tone map
`tone` writes `data-tone`. Text contrast on the ground is at least 4.5:1 in both themes (over `--x-color-bg`, `panel` and `surface`).

| tone | ground | text | use for |
|---|---|---|---|
| `neutral` | transparent, 1px `--x-color-line` inset edge | `--x-color-muted` | draft, inactive, internal |
| `accent` | `--x-color-accent-soft`, 1px `--x-color-accent` inset edge | `--x-color-ink` | current, default, primary |
| `ok` | `--x-color-ok-soft` | `--x-color-ok` | active, published, passed |
| `warn` | `--x-color-warn-soft` | `--x-color-warn` | pending, invited, expiring |
| `danger` | `--x-color-danger-soft` | `--x-color-danger` | failed, blocked, banned |

`accent` keeps ink text because `--x-color-accent` on its soft ground is under 3.2:1 in dark; the accent shows as the edge.

## Props
- `status` and `tone` are independent. Pass one. With both, the tone's look wins (tone rules come after status rules in the CSS); `data-status` is still written.
- Every other `span` attribute (`title`, `id`, `role`, `aria-*`, `data-*`, handlers) goes on the `span`; `className` is added to `badge`.


## Rules
- Lowercase, one word. The colour repeats the word; it never replaces it.
- Tint + text only: no left stripe. The only edges are the 1px inset rings of `unchanged`, `neutral` and `accent`.
- Use `tone` for a record's state and `status` only for sync status. For a live state (running, online) use `StatusDot` with a `label`.
