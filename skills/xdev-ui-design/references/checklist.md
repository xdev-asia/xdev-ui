# Pre-delivery checklist

Walk this in the running app before calling a screen done. Items marked (audit) are also reported by `scripts/audit.mjs` in `xdev-ui-review`; its `references/checklist.md` has the full manual review.

## Contents
- Visual quality
- Interaction
- Dark and light
- Layout
- Accessibility
- Evidence

## Visual quality
- [ ] (audit) No colour literal, raw `px` (except 1px hairlines) or raw font in app CSS.
- [ ] Every token is chosen by role (`tokens.md`).
- [ ] One accent on screen: the primary action and the current place.
- [ ] Cyan appears only as the focus ring.
- [ ] Shadows only on menus, popovers and dialogs.
- [ ] `BrandMark` v9 in the shell with the app name in text; the cursor is orange in both themes.
- [ ] Every thing in a collection has its own `Emblem`; no repeated grey circle.
- [ ] (audit) No coloured left stripe on a rounded card or row.
- [ ] Icons come from the library set; no emoji.

## Interaction
- [ ] (audit) One primary button per surface.
- [ ] Hover-revealed actions also appear on keyboard focus and on touch.
- [ ] Destructive actions confirm in a `Dialog` that names the object.
- [ ] Disabled controls show their reason in text.
- [ ] Success shows a `Toast` in past tense; failure a `Banner` that keeps the input.

## Dark and light
- [ ] Both themes screenshot-checked on every changed page.
- [ ] No surface turns pure white in dark or pure black in light by accident.
- [ ] Third-party logos sit on `Emblem` plates and stay visible in both.
- [ ] (audit with `--contrast`) No token pair below WCAG contrast.

## Layout
- [ ] One `Container` per page; nothing runs edge to edge at 1440px.
- [ ] Checked at 375, 768 and 1440px: no horizontal page scroll (also at 320px); tables scroll inside their wrapper or use `stack`.
- [ ] (audit) No `fixed-width` or `nowrap` warnings left unexplained.
- [ ] On a phone, modal dialogs open as a bottom sheet and drawers fill the width; header and toolbar actions wrap.
- [ ] Under `pointer: coarse` every control is at least 44px.
- [ ] Header controls are as wide as their content.
- [ ] The top bar has the page's background and no rule under it at the top of the page.
- [ ] A heading and a count above every grid and list.
- [ ] Empty, loading and error states designed for each region.

## Accessibility
- [ ] (audit) Icon-only buttons are named; no positive `tabIndex`; focus outline never removed without a replacement.
- [ ] Tab order follows reading order; the skip link is first.
- [ ] (audit with `--i18n`) `en` and `vi` have the same keys; switch language and check nothing is clipped.
- [ ] (audit) Movement has a reduced-motion guard.

## Evidence
Attach to the change: the audit output, and dark plus light screenshots at 1440px and 375px (and 768px when the layout changes there). When porting, put the source screenshot beside each.
