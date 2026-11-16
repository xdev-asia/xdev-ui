---
name: xdev-ui-design
description: "Design system guide for xDev products on @xdev-asia/ui: a priority-ranked rule catalogue with rule IDs (accessibility, interaction and focus, tokens and colour, brand and logo v12, layout and responsive, states and feedback, typography, navigation, motion, data display), the token roles with dark and light values, logo rules, screen recipes, a porting guide for re-skinning another product's UI as xDev, anti-patterns and a pre-delivery checklist. Use when designing, restyling, porting or reviewing the look and feel of any xDev screen, choosing tokens, colours, type, spacing or the logo, or deciding whether a new or customised component belongs in xdev-ui."
license: Apache-2.0
---

# Design xDev screens with @xdev-asia/ui

xDev looks like a quiet developer tool: dark first, graphite surfaces, 1px hairlines instead of shadows, one blue accent, cyan only for focus, the orange agent blade only in the logo. This skill decides the look. It hands off the rest: app setup to `xdev-ui-build-app`, console screens to `xdev-ui-admin`, the audit to `xdev-ui-review`, WCAG and keyboard contracts to `xdev-ui-ux-standards`.

## When to apply

| | situations |
|---|---|
| **Must use** | a new screen or app for xDev; restyling or porting a screen from another product; choosing a colour, size, font, radius, shadow or icon; placing the logo; a design or UI review |
| **Recommended** | a new component in xdev-ui; a screenshot comparison before calling a UI done; writing app CSS beyond placing parts |
| **Skip** | back-end only work; copy changes with no layout effect; tests that do not render UI |

Decide by asking: will a person *see* a different pixel after this change? If yes, apply.

The owner's own decisions (1:1 ports by measurement, the top bar, the brand, no left stripes) are in [owner's notes](references/owner-notes.md); they override the rules below.

## Rule categories by priority

| # | category | impact | key checks | anti-patterns | reference |
|---|---|---|---|---|---|
| 1 | Accessibility | CRITICAL | contrast 4.5:1 text and 3:1 UI, names on icon buttons, focus ring visible | colour as the only signal, `outline: none` | [rules](references/rules.md#1-accessibility) |
| 2 | Interaction and focus | CRITICAL | targets of 24px or more, one primary per surface, keyboard reaches everything | hover-only actions, positive `tabIndex` | [rules](references/rules.md#2-interaction-and-focus) |
| 3 | Tokens and colour | HIGH | every colour, size and font is a token; one accent; cyan only for focus | hex in app CSS, a second accent | [tokens](references/tokens.md) |
| 4 | Brand | HIGH | `BrandMark` v12 in chrome, agent side stays `--brand-agent`, clear space | a redrawn logo, a recoloured tile | [brand](references/brand.md) |
| 5 | Layout and responsive | HIGH | one `Container` per page, spacing on the 4px scale, works at 360px | edge-to-edge content, stretched controls | [rules](references/rules.md#5-layout-and-responsive) |
| 6 | States and feedback | HIGH | empty, loading, error and success for every region | blank page on error, spinner per row | [rules](references/rules.md#6-states-and-feedback) |
| 7 | Typography | MEDIUM | `font: var(--type-*)` only, Roboto and JetBrains Mono | raw sizes, a third face, all caps prose | [tokens](references/tokens.md#type) |
| 8 | Navigation and information | MEDIUM | current place marked by the accent, page title, counts above grids | two nav systems, unlabelled grids | [rules](references/rules.md#8-navigation-and-information) |
| 9 | Motion | MEDIUM | short positional transitions only, reduced-motion guard | bouncing, motion that carries meaning | [rules](references/rules.md#9-motion) |
| 10 | Data display | LOW | `StatusDot` with words, `Emblem` for things, mono for numbers and IDs | coloured left stripe, same grey circle everywhere | [rules](references/rules.md#10-data-display) |

## Quick reference

Rule IDs; the full rule, the why and the check are in [rules](references/rules.md).

1. **Accessibility**: `a11y-contrast`, `a11y-not-colour-alone`, `a11y-icon-name`, `a11y-focus-visible`, `a11y-forced-colors`, `a11y-landmarks`, `a11y-lang`
2. **Interaction**: `int-target-size`, `int-one-primary`, `int-keyboard-path`, `int-no-hover-only`, `int-confirm-destructive`, `int-disabled-reason`
3. **Tokens and colour**: `tok-no-literal`, `tok-semantic-role`, `tok-one-accent`, `tok-signal-is-focus`, `tok-hairline-not-shadow`, `tok-tint-not-fill`, `tok-both-themes`
4. **Brand**: `brand-mark-v12`, `brand-agent-side`, `brand-clear-space`, `brand-no-redraw`, `brand-app-name`
5. **Layout**: `lay-container`, `lay-space-scale`, `lay-radius-scale`, `lay-360`, `lay-control-width`, `lay-shell`
6. **States**: `st-empty-next-step`, `st-loading-per-region`, `st-error-retry`, `st-toast-past-tense`, `st-keep-input`
7. **Typography**: `type-token-only`, `type-two-faces`, `type-scale-roles`, `type-mono-data`, `type-sentence-case`
8. **Navigation**: `nav-current-accent`, `nav-page-title`, `nav-count-heading`, `nav-one-system`
9. **Motion**: `mot-short`, `mot-transform-only`, `mot-reduced`, `mot-pulse-working-only`
10. **Data display**: `data-status-words`, `data-emblem-face`, `data-no-left-stripe`, `data-dimmed-off`, `data-mono-numbers`

## How to use

1. **Classify the request**: new screen, restyle, port from another product, new component, or review.
2. **Pick the recipe** for the screen type in [screens](references/screens.md): container width, header, body pattern, states. For console pages also read the matching `xdev-ui-admin` reference.
3. **Compose from the library.** Check props with `xdevui_get_component`, find tokens with `xdevui_search_tokens`, icons with `xdevui_list_icons`. A part the library lacks, or a library part you need to change, goes into xdev-ui first; app CSS only places parts.
4. **Apply tokens** by role, never by value ([tokens](references/tokens.md)). App classes carry the app's prefix, never `x-` or `ws-`.
5. **Place the brand** ([brand](references/brand.md)): `BrandMark` in the shell, the app name beside it.
6. **Porting?** Keep the other product's layout and information order; replace its look with xDev's ([porting](references/porting.md)).
   Read the [owner's notes](references/owner-notes.md) first: a 1:1 port matches measured geometry, the top bar uses icon buttons, and they win over the general rules.
7. **Verify**: run the audit, take dark and light screenshots at 1440px and 375px (and check 768px: no horizontal page scroll), walk the [checklist](references/checklist.md). Compare with the reference picture if there is one.

```bash
node node_modules/@xdev-asia/ui/skills/xdev-ui-review/scripts/audit.mjs src --i18n src/strings --contrast
```

## A screen in xDev style

```tsx
import { Button, Container, Emblem, Grid, PageHeader, ResourceCard, StatusDot } from "@xdev-asia/ui";

<Container size="xl">
  <PageHeader
    title={t("providers.title")}
    description={t("providers.count", { n: providers.length })}
    actions={<Button icon="plus">{t("providers.add")}</Button>}
  />
  <Grid minItemWidth="15rem" gap={3}>
    {providers.map((p) => (
      <ResourceCard
        key={p.id}
        href={`#/providers/${p.id}`}
        leading={<Emblem name={p.name} src={p.logo} text={p.mark} color={p.color} />}
        title={p.name}
        status={<StatusDot tone={p.ok ? "ok" : "warn"} label={t(p.ok ? "status.ok" : "status.check")} />}
        dimmed={!p.enabled}
      />
    ))}
  </Grid>
</Container>
```

## Common rules for professional UI

- **Quiet by default.** Surfaces are `--bg-0` to `--bg-3`; borders are 1px `--line`. Shadows only on menus, popovers and dialogs (`--shadow-menu`, `--shadow-dialog`).
- **One accent, one job.** `--accent` marks the next action and the current place. A thing's own colour lives only in its `Emblem`.
- **State is words plus a dot or tint.** Never a colour alone, never a coloured left stripe on a rounded card or row.
- **Dense, not cramped.** Rows are `--h-row`, toolbars `--h-toolbar`, gaps from `--x-space-2` to `--x-space-6`.
- **Every string is translated**, in `en` and `vi`, sentence case, no emoji, no exclamation marks.
- **Look at it.** The audit cannot see ugliness; screenshots can.

## Pre-delivery checklist

Short form; the full list with how to check is [checklist](references/checklist.md).

- **Visual**: no literal colour or size in app CSS; one accent; logo v12 in the shell; icons from the library only, no emoji.
- **Interaction**: one primary per surface; focus ring on every control; targets 24px or more; destructive actions confirm.
- **Dark and light**: both themes screenshot-checked; no surface turns pure white or black by accident; logos on `Emblem` plates.
- **Layout**: one `Container`; no horizontal scroll at 360px; header controls as wide as their content.
- **Accessibility**: audit clean with `--contrast`; keyboard path matches reading order; `en` and `vi` complete.
