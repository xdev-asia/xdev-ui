# Grep recipes

Quick searches when the audit reports a rule or when you review without running it. Run them from the app source folder.

## Contents
- Colours and sizes
- Type
- Stripes and focus
- Components and tokens

## Colours and sizes
```bash
grep -rnE '#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(|oklch\(' --include='*.css' --include='*.ts' --include='*.tsx' .
grep -rnE '[0-9]+px' --include='*.css' . | grep -v '1px'
```
Replace with a token: ask `xdevui_search_tokens` with the colour role ("border", "muted text") or the space you need.

## Type
```bash
grep -rnE 'font-size|fontSize' --include='*.css' --include='*.tsx' .
grep -rn 'font:' --include='*.css' . | grep -v 'var(--type-'
```
Use `font: var(--type-body)`, `var(--type-label)`, `var(--type-page-title)` or `var(--type-stat)`.

## Stripes and focus
```bash
grep -rnE 'border-left|border-inline-start|borderLeft' --include='*.css' --include='*.tsx' .
grep -rnE 'outline:\s*(none|0)' --include='*.css' .
```
A stripe becomes a `--bg-3` tint, a 1px `--line` border or a `StatusDot`. Never remove the outline: the ring is `--x-color-signal`.

## Components and tokens
```bash
grep -rnoE '<[A-Z][A-Za-z]+' --include='*.tsx' . | sort | uniq -c | sort -rn
grep -rnoE 'var\(--[a-z0-9-]+' --include='*.css' --include='*.tsx' . | sort | uniq -c | sort -rn
```
Check each component with `xdevui_get_component` and each token with `xdevui_search_tokens`; icons with `xdevui_list_icons`.
