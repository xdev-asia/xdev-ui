# ServiceStatus

One line for the foot of a sidebar (`AppShell` `navFooter`): a `StatusDot` with the state of the service the console runs, in words, and its version or region in quiet mono at the end.

## Anatomy
`div.x-service-status` > `StatusDot` (with label) + `.x-service-status-detail`.

## Rules
- Say the state in `label` ("Gateway online", "Gateway unreachable"); the dot's colour is never the only signal.
- `tone`: `ok` up, `warn` degraded, `danger` down, `neutral` not known yet.
- `detail` is short: a version ("v1.4.0"), a region. Not a sentence.
- It is not live by itself: the app sets `tone` and `label` from its own check.
