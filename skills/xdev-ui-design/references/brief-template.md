# Brief template: the app's DESIGN.md

Copy this into the app's root as `DESIGN.md` at gate 3 of the direction (`direction.md`) process, then keep it current. `xdev-ui-improve` reads it first as the app's own design source, and the critique (`critique.md`) scores against it. Keep it short: a section with nothing to say gets `None`.

```markdown
# <App name> design brief

Craft read: <one sentence: direction, for whom, what is first, what is left out>
Updated: <date> · Based on @xdev-asia/ui <version>

## Product
<What it is, who uses it, who pays for it. Two or three lines.>

## People and context
| person | how often | device | expertise | main worry |
|---|---|---|---|---|

## Main tasks
1. <verb phrase, the most frequent task first>

## Direction
- Chosen: <name> — <what it optimises for>
- Rejected: <name> — <why>
- Density: <compact rows and toolbars | roomy cards | mixed, per screen>
- Emphasis: <the one thing that carries the accent on each main screen>

## Preserve
<Things that stay: information order, keyboard paths, URLs, names, measured layouts. One line each.>

## Screens
| screen | route | pattern | main parts | states designed |
|---|---|---|---|---|
| <Runs> | /runs | list with detail pane | DataTable, FacetFilter, Drawer | empty, loading, error, partial |

## States
<How empty, loading, error, offline, no permission and partial data look on this app. Name the parts.>

## Content and voice
<Terms the product uses, words it avoids, `en` and `vi` notes.>

## Decisions and learned constraints
| date | decision | why | source |
|---|---|---|---|

## Out of scope
<What this brief does not cover, and what goes into @xdev-asia/ui instead of the app.>
```

## Rules for the brief

- It records choices the xdev-ui rules leave open. It never restates a token value or overrides a rule; a brief line that conflicts with rules (`rules.md`) or the owner's notes is wrong.
- Every critique round that finds a repeat problem adds one line to "Decisions and learned constraints", so the next build does not make it again.
- Library gaps are listed under "Out of scope" with the consumers that need them; they are fixed in xdev-ui, not in the app.
