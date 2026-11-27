---
name: xdev-ui-improve
description: "Audits one existing screen of an app built with @xdev-asia/ui against the design rules that actually govern it (the app's own guidance, the xdev-ui-design rule IDs, component Rules, tokens), keeps only findings with a cited contract, a proven runtime path and one correction, reports at most three, and writes self-contained plans under design-plans/ for another agent to carry out. Read-only on product source. Use when asked to improve, refine, polish or clean up an xDev screen without redesigning it, to investigate design drift from @xdev-asia/ui, or to prepare a design handoff."
license: Apache-2.0
---

# Improve an xDev screen with evidence

Find the few changes that a screen's own design system proves are wrong, and hand each one off as a plan. Keep the product's identity; prefer no finding to an unsupported one. This skill writes plans, never product code: `xdev-ui-review` runs the audit and fixes, `xdev-ui-design` decides a new look.

## When to use

- "Improve", "polish", "tidy" or "make this screen better" on an existing `@xdev-asia/ui` screen.
- Design drift: a screen that no longer matches the library or its siblings.
- A handoff: another agent or person will make the change.

Skip it for a new screen (use `xdev-ui-admin` or `xdev-ui-design`), for the pre-delivery pass (use `xdev-ui-review`) and for behaviour bugs.

## Boundaries

- Never modify product source. Create or edit files only under `design-plans/`.
- Do not install, format, commit or push. Do not edit design documentation; record an accepted documentation change in the plan.
- Use screenshots or a running app only when the person gives them or asks for visual inspection.
- Every plan stands alone: its executor has not seen this audit or the conversation.

## 1. Select the surface

Honour the scope the person gives. If it is broad, pick one route and the parts it renders for one main task, and say which. Start from the route and its layout, then follow what it renders: page, compositions, library parts and their props, app CSS, tokens. Do not start with a repository-wide search for inconsistencies.

A connection exists only when it is proven by a render, an import, a prop, CSS that applies, or a loaded file. Similar names, nearby files and "it is the same idea" are not connections.

## 2. Reconstruct the governing system

Read, in this order, and keep only what governs the selected surface:

1. The app's own `DESIGN.md` (the brief `xdev-ui-design` writes from `references/brief-template.md`: direction, preserve list, decisions and learned constraints), `AGENTS.md` or design notes, when current. A preserve-list item or a recorded decision is a contract; a finding that would break one is dropped.
2. The owner's notes and rule catalogue of `xdev-ui-design`: `xdevui_get_skill name="xdev-ui-design" file="references/owner-notes.md"`, then `file="references/rules.md"`. Owner's notes win over the rules.
3. The `## Rules` of each library part the surface mounts (`xdevui_get_component`) and the guidelines (`xdevui_get_guidelines`).
4. Tokens by role (`xdevui_search_tokens`).

Drafts, proposals and task lists are intent, not rules. Missing documentation is not a finding.

```markdown
## Design language
- Audited surface:
- Design sources:
- Documented decisions:
- Governing owners and consumers:
- Explicit exceptions:
```

Write `None documented` under exceptions unless a cited source names one.

## 3. Prove each finding

First collect candidates: labels and copy, the current place and selected states, the four states of each region, sibling variants, the 375px branch. Then keep a candidate only with all three proofs:

1. **Contract**: a binding rule for this property and scope (a rule ID such as `tok-one-accent`, a component `## Rules` line, an owner's note), or a direct contradiction inside the same task's presentation. "Prefer", "generally", repetition and silence are not contracts.
2. **Runtime**: the cited rule or value reaches this surface through the traced path.
3. **Correction**: one change the evidence requires, naming the exact token, prop, variant or part (`StatusDot`, `variant="secondary"`, `var(--text-2)`). If the evidence allows two answers or needs invented intent, drop it.

In scope: tokens, colour, type, spacing, layout, copy, part choice and variant, responsive presentation, and explicit rule violations. Hierarchy, density and discoverability need screenshots or user evidence. Behaviour, data, routing, performance and code quality are out of scope unless the person asks; accessibility only when asked (then cite `xdev-ui-ux-standards`).

A finding the audit already reports (`node <review-skill-dir>/scripts/audit.mjs src`) can be cited as runtime evidence, but the fix belongs to `xdev-ui-review`; list it once under "Improve first" only if nothing else survives.

## 4. Try to falsify each finding

Re-open every cited source. Delete the finding when the cited code does not match, the rule does not govern that property and surface, an owner's note or exception allows it, the correction is not unique, it invents intent, or another finding has the same root.

## 5. Report

Order by confidence, then user impact, reach and cost. Stop at three.

```markdown
## Design language
(the block from step 2)

## Findings
| # | Problem | Evidence | Proposed change | Scope | Confidence |
| --- | --- | --- | --- | --- | --- |

## Improve first
<The one finding with the strongest evidence and highest leverage, and why.>
```

Evidence cites contract, runtime path and consequence as `file:line` or rule ID. One correction per row; a row missing any column is deleted. With nothing left, write `No supported findings were found.` and `No supported recommendation.`

Then stop and ask which findings to turn into plans, unless the person already chose one. Asked to fix directly: offer a plan; do not edit product code.

## 6. Write the plans

One plan per selected change, not one per symptom, in `design-plans/<short-outcome>.md`, from [the plan template](references/plan-template.md). Before writing, re-open every cited source, record the commit (`git rev-parse --short HEAD`), name the exact library parts, tokens and an exemplar file, and list every affected surface. Update an existing plan instead of writing a second one.

A part the library lacks goes into `@xdev-asia/ui`, not into the app: the plan says so and names the consumers that would share it. Never plan a lookalike component, an invented prop or a new token in app CSS.

When asked to reconcile, re-check existing plans against current source and update evidence, affected surfaces and status.
