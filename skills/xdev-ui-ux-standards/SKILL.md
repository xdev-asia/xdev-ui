---
name: xdev-ui-ux-standards
description: "Applies WCAG 2.2 AA, the WAI-ARIA Authoring Practices patterns, the macOS, Windows and GNOME interface guidelines, the ten usability heuristics and the VS Code UX guidelines to desktop UI built with @xdev-asia/ui: a keyboard and ARIA contract per component, focus, contrast, target size, motion, forced colours, status messages and one cross-platform decision where the platforms disagree. Use when designing a screen or component, before building one, or for a standards review after the xdev-ui-review audit."
license: Apache-2.0
---

# UX and accessibility standards for @xdev-asia/ui

The bar is WCAG 2.2 level AA, the APG pattern for every widget, and one decision per platform conflict. Each rule in the references names the page it came from. Anything not confirmed on a fetched page is marked [Unverified].

## When to use

- **Design**: before you draw a new screen, dialog or widget.
- **Build**: while you wire keyboard, ARIA, focus, motion and status messages.
- **Review**: after `node <review-skill-dir>/scripts/audit.mjs` passes, for what a script cannot see.

## How it fits with the other skills

| skill | answers |
|---|---|
| `xdev-ui-build-app` | how to set up and build the app: shell, theme, i18n, states |
| `xdev-ui-ux-standards` | what the result must satisfy, with the source for each rule |
| `xdev-ui-review` | how to check it: `audit.mjs` and the manual checklist |

The review audit rules `focus-outline`, `forced-colors`, `positive-tabindex`, `icon-button-name`, `target-size`, `reduced-motion` and `contrast` are the automated part of this skill. Their rule IDs are in [standards map](references/standards-map.md).

## 1. Design

1. Pick the APG pattern for every interactive part from [patterns](references/patterns.md). If no pattern fits, use a native element (`button`, `input`, `select`, `a`) instead of a custom role.
2. Take the platform decisions from [platforms](references/platforms.md): dialog button order, capitalization, shortcuts, window controls.
3. Name the four states of each region: empty, loading, error and done. Check them against heuristics 1, 3, 5 and 9 in [heuristics checklist](references/heuristics-checklist.md).
4. Use colour tokens only. Text tokens on their grounds pass 4.5:1. The known exceptions (`--text-3`, `--line`, `--x-color-line`) are listed in the standards map. Do not use them for text a user must read or as the only boundary of a control.

## 2. Build

- Every action works with Tab, Shift+Tab, Enter and Space. No `tabIndex` above 0.
- A composite widget (menu, tabs, listbox, tree, toolbar, grid) is one Tab stop. Arrow keys move inside it, by roving `tabIndex` or `aria-activedescendant`.
- Esc closes the topmost layer and focus returns to the control that opened it. Focus never drops to `body`.
- The focus ring stays visible. Remove the outline only where a `:focus-visible` rule draws a replacement. Prefer `outline`: forced colours drop `box-shadow`.
- An icon-only control is `IconButton` with a `label`, or `Icon` with a `label` inside a named button.
- A status message (saved, 18 results, copied) is in a `role="status"` region that exists before the text changes. Errors that need attention use `role="alert"`, sparingly.
- A pointer target is at least 24 by 24 CSS px, or it has 24px of clear space around it.
- Animation that moves, scales or rotates stops under `prefers-reduced-motion: reduce`.
- A ring, border or state drawn with `box-shadow` or a background image gets a `forced-colors: active` fix with system colours.

```css
.thing:focus-visible {
  outline: 0.125rem solid var(--x-color-focus);
  outline-offset: 0.125rem;
}
@media (forced-colors: active) {
  .field:focus-visible { outline: 0.125rem solid Highlight; }
}
@media (prefers-reduced-motion: reduce) {
  .panel { animation: none; transition: none; }
}
```

## 3. Review

1. Run the review audit with the contrast pass:

   ```bash
   node <review-skill-dir>/scripts/audit.mjs src --contrast
   ```

2. For each component on the screen, test its row in [patterns](references/patterns.md) with the keyboard only.
3. Walk the [heuristics checklist](references/heuristics-checklist.md) in the running app, in dark and light, at 320px wide, with reduced motion on and, on Windows, a contrast theme on.
4. Report each finding with its rule ID from the standards map, its file and line, and the fix. Say which checks you did not run.

## Known gaps in the library

These are listed so a review does not blame the app for them. Fix them in `@xdev-asia/ui`, not in the app.

- `Menu`: `role="menu"` without arrow keys, Home, End, typeahead or roving focus.
- `TabStrip`: `role="tablist"` without arrow keys; close buttons sit inside the tablist.
- `CommandPalette`: a listbox with options but no `combobox` role, no `aria-activedescendant` and no arrow keys.
- `Toolbar` and `ZoomBar`: arrow keys work, but every control is also a Tab stop.
- `Dialog` with `alert`: no `aria-describedby` on the message.
- No component ships a `forced-colors` or `prefers-contrast` rule.

## References

- [Standards map](references/standards-map.md): each rule, its source URL, how it applies and its check.
- [Patterns](references/patterns.md): keyboard and ARIA contract for every component.
- [Platforms](references/platforms.md): macOS, Windows and Linux differences and the xDev decision.
- [Heuristics checklist](references/heuristics-checklist.md): the reviewer's list.
