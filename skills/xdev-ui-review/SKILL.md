---
name: xdev-ui-review
description: "Audits a React app that uses @xdev-asia/ui against the design-system rules: tokens instead of raw colours, px and font sizes, no coloured left stripes, one primary button per surface, sentence-case labels in en and vi, a visible focus ring, and a usable 360px layout. Use before committing UI work with @xdev-asia/ui or when asked to review such UI."
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
- `--manifest <path>` points at `ai-manifest.json` when `node_modules/@xdev-asia/ui/dist/ai-manifest.json` does not exist; without a manifest the `unknown-token` rule is skipped with a note.
- Output is `file:line rule message`. Exit code 1 means at least one error; warnings never fail.

| rule | level | what it flags |
|---|---|---|
| `raw-colour` | error | `#hex`, `rgb(`, `hsl(`, `oklch(` in `.css`, `.ts`, `.tsx` |
| `raw-px` | error | a size in `px` other than `1px` in CSS or a `style` prop |
| `raw-font` | error | `font-size`, `fontSize`, or `font:` without `var(--type-*)` |
| `left-stripe` | error | `border-left`, `border-inline-start` with a width, or an inset left shadow |
| `unknown-token` | error | `var(--x)` that is not a design token or defined in the app |
| `focus-outline` | error | `outline: none` or `outline: 0` |
| `i18n-parity` | error | `en` and `vi` differ in keys, or a value is empty |
| `primary-count` | warn | more than one primary `Button` in one file |
| `label-voice` | warn | `!`, emoji, or Title Case Of Three Words in UI text |

## 2. Fix, do not silence

- Colour, size, type: replace the literal with a token. Find it with `xdevui_search_tokens` (see `references/grep-recipes.md`).
- Stripe: use a tint, a 1px border or a `StatusDot`.
- Do not delete the audit rule or the line to make it pass; do not add `outline: none`.

## 3. Check by hand

Work through `references/checklist.md`: 360px width, dark and light, `en` and `vi`, keyboard order, focus ring, empty, loading and error states, destructive actions.

## 4. Report

List what you fixed and what is left. Say which manual checks you did not run; do not claim them.
