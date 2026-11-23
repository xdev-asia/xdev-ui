# StatusDot

8px dot for the live state of a session, a pull request, a CI check or any generic status.

## Scales
| kind | values |
|---|---|
| `state` (session) | working · waiting · failed · done · idle · exited |
| `pr` | open · draft · merged · closed |
| `check` | pass · pending · fail · skipping · cancel |
| `tone` (generic) | ok · warn · danger · accent · neutral |

## Rules
- Pass exactly one of `state`, `pr`, `check`, `tone`.
- `tone` is for status that is none of the other three (user active, invited, suspended). Map it in the app: ok = active, warn = invited, danger = suspended, neutral = inactive. Always pair it with a `label`.
- `pulse` only for `working`: the one thing in the UI that moves on its own.
- `label` renders as visible text right after the dot, inside `span.x-dot-label`; it is the text equivalent of the colour.
- `className` goes on the outer element: the `.x-dot-label` wrapper with a label, the dot itself without.
- With `label` the dot is decorative (`aria-hidden`) and the text carries the state. Without it, put the state in the row's accessible name.
