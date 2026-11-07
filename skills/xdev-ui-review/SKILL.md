---
name: xdev-ui-review
description: "Audits a React app that uses @xdev-asia/ui against the design-system rules: tokens instead of raw colours, px and font sizes, no coloured left stripes, one primary button per surface, sentence-case labels in en and vi, a visible focus ring, accessible names, target size, reduced motion, forced colours, token contrast, and a usable 360px layout. Use before committing UI work with @xdev-asia/ui or when asked to review such UI."
license: Apache-2.0
---

# Review a UI built with @xdev-asia/ui

Run the script, fix every error, then walk the manual checklist.

## 1. Run the audit

```bash
node <skill-dir>/scripts/audit.mjs src --i18n src/i18n
```

- `<skill-dir>` is where this skill is installed, e.g. `.claude/skills/xdev-ui-review`.
- `--i18n <dir>` compares `en.ts` and `vi.ts` in that folder.
- `--contrast` adds a WCAG contrast report for the theme token pairs (needs the manifest).
- `--manifest <path>` points at `ai-manifest.json` when `node_modules/@xdev-asia/ui/dist/ai-manifest.json` does not exist; without a manifest the `unknown-token` rule is skipped with a note.
- Output is `file:line rule message`. Exit code 1 means at least one error; warnings never fail.

| rule | level | what it flags |
|---|---|---|
| `raw-colour` | error | `#hex`, `rgb(`, `hsl(`, `oklch(` in `.css`, `.ts`, `.tsx` |
| `raw-px` | error | a size in `px` other than `1px` in CSS or a `style` prop |
| `raw-font` | error | `font-size`, `fontSize`, or `font:` without `var(--type-*)` |
| `left-stripe` | error | `border-left`, `border-inline-start` with a width, or an inset left shadow |
| `unknown-token` | error | `var(--<name>)` that is not a design token or defined in the app |
| `focus-outline` | error | `outline: none`/`0` with no `:focus-visible` replacement for the same selector |
| `positive-tabindex` | error | `tabIndex` or `tabindex` above 0 |
| `icon-button-name` | error | a `button` whose only content is an unnamed icon, or a self-closing `Button` with `icon` and no name |
| `i18n-parity` | error | `en` and `vi` differ in keys, or a value is empty |
| `primary-count` | warn | more than one `Button variant="primary"` in one file |
| `label-voice` | warn | `!`, emoji, or Title Case Of Three Words in UI text |
| `target-size` | warn | a width or height under 24px on a control selector, with no 24px minimum |
| `reduced-motion` | warn | an animation whose keyframes move content, in a file with no `prefers-reduced-motion` query and no app-wide `*` guard |
| `forced-colors` | warn | the outline replaced only by `box-shadow` or border colour, with no `forced-colors` rule in the file |
| `contrast` | error or warn | a token pair below 4.5:1 (text) or 3:1 (UI parts); only with `--contrast` |

## 2. Fix, do not silence

- Colour, size, type: replace the literal with a token. Find it with `xdevui_search_tokens` (see `references/grep-recipes.md`).
- Stripe: use a tint, a 1px border or a `StatusDot`.
- Do not delete the audit rule or the line to make it pass; do not add `outline: none`.

## 3. Check by hand

Work through `references/checklist.md`: 360px width, dark and light, `en` and `vi`, keyboard order, focus ring, empty, loading and error states, destructive actions.

Then check each widget against its APG keyboard and ARIA contract and walk the heuristics checklist from the `xdev-ui-ux-standards` skill. It gives each audit rule its WCAG or platform source.

## 4. Report

List what you fixed and what is left. Say which manual checks you did not run; do not claim them.
