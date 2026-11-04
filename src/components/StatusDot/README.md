# StatusDot

8px dot for the live state of a session, a pull request or a CI check.

## Scales
| kind | values |
|---|---|
| `state` (session) | working · waiting · failed · done · idle · exited |
| `pr` | open · draft · merged · closed |
| `check` | pass · pending · fail · skipping · cancel |

## Rules
- Pass exactly one of `state`, `pr`, `check`.
- `pulse` only for `working`: the one thing in the UI that moves on its own.
- With `label` the dot is decorative (`aria-hidden`) and the text carries the state. Without it, put the state in the row's accessible name.
