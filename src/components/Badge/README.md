# Badge

Small tinted label for a file or kit item's sync status.

## Status map
| status | ground | text | meaning |
|---|---|---|---|
| `new` | `--x-color-ok-soft` | `--x-color-ok` | not in the target yet |
| `changed` | `--x-color-signal-soft` | `--x-color-signal` | differs from the target |
| `unchanged` | `--x-color-surface-2` | `--x-color-muted` | identical |
| `foreign` | `--x-color-warn-soft` | `--x-color-warn` | owned by something else; will not be touched |

## Rules
- Lowercase, one word. The colour repeats the word; it never replaces it.
- Tint + text only: no border, no left stripe.
