# Design plan template

Copy this into `design-plans/<short-outcome>.md` and fill every section. The executor has no other context.

```markdown
# <Outcome in one line>

Written against: <short commit hash, or unavailable>

## Evidence chain

- Surface: `<route, page file, or rendered state>`
- Problem: <what is on screen or in the code, observed directly>
- Contract: `<rule ID, component ## Rules line, owner's note, or app DESIGN.md section>`
- Runtime path: `<route> -> <page> -> <part or class> -> <token or prop>`
- Owner: `<file that should change>`
- Affected surfaces: `<every route or file that renders the owner>`
- Uncertainty: <none, or what must be checked first>

## Design decision

<The change, at the right scope, and why it removes the root problem.>

## Reuse

- Library part, prop or variant: `<e.g. StatusDot tone="warn" label=...>`
- Token: `<e.g. var(--text-2)>`
- Exemplar: `<a file in this app or in @xdev-asia/ui examples that already does it right>`

If the library lacks the part, say why no existing part, prop or token expresses the decision, which consumers would share it, and that the change goes into `@xdev-asia/ui`, not the app.

## Changes

1. `<exact path>`
   - Change: <implementation-ready description>
   - Keep: <what must not change: identity, behaviour, strings>
   - Verify: <observable result>

## Scope

- Inherits the change: <consumers>
- Check, may be affected: <consumers>
- Out of scope: <valid exceptions and unrelated work>

## Validation

- Task: <the user task and the expected outcome>
- Screen: dark and light, 375, 768 and 1440px, `en` and `vi`, empty, loading, error and full states
- System: no new token, class or lookalike part in the app; the library part is used as its README says
- Repository: `node <review-skill-dir>/scripts/audit.mjs src --i18n <strings-dir>` -> no new findings; the project's tests pass

## Stop conditions

- Stop if <an assumption fails, the owner differs, or the scope has to grow>.

## Design documentation

- After acceptance: <the decision to record and where (the app's DESIGN.md or the owner's notes), or none>
```
