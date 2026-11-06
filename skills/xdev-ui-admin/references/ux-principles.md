# UX principles for admin screens

Admin users repeat the same task many times a day. Optimise for speed, scanning and safety, not for first impressions.

## Contents
- Information
- Actions
- Feedback
- Language
- Accessibility

## Information
- **One job per page.** The `PageHeader` title says what the page is ("Users", "Order #1042"); the description says what can be done here, in one line or not at all.
- **Scan, then act.** Lists lead with the column people search by (name, code), then status, then the rest. Numbers right-aligned in `mono`, dates in one format for the whole app.
- **Density.** Default table row height, no zebra stripes, hairlines between rows. Remove columns before shrinking text; mark the rest `hideNarrow`.
- **Progressive disclosure.** Show the 5 to 7 facts people need; put the rest behind `Tabs`, `Disclosure` or the detail page. Never hide a field that has an error.
- **Stable layout.** Skeletons match the real shape, so nothing jumps when data arrives. Buttons keep their width while busy (the label changes, not the size).

## Actions
- **One primary button per view** (page, dialog, drawer). Everything else is secondary or ghost. In a row of actions the primary is last.
- **Verbs on buttons**: "Create user", "Suspend 3 users", never "OK", "Yes" or "Submit".
- **Reversible beats confirmed.** Prefer an action that can be undone (archive, suspend) and a `Toast` that says so. Ask with a `Dialog` only for what cannot be undone, and name the object and the count.
- **Keep the user's work.** On a failed save show the error and keep every field; leaving a dirty form asks first (`useUnsavedGuard`).
- **Hide what the role can never do; disable what it cannot do now, and say why** (hint or tooltip).
- **Keyboard first.** Enter submits a form, Esc closes the top overlay, `/` or Ctrl/Cmd+K can focus search or open the `CommandPalette`.

## Feedback
- Respond within 100 ms: a pressed state, `busy` on the button, or a `Skeleton` for a region.
- Every data region has loading, error and empty states (see states-feedback reference).
- Success of a background action: `Toast`. Failure of a form: inline, on the field or in the form's `error`. Failure of a page load: `Banner` with a "Try again" `action`.
- Do not toast what the user can already see changed on screen (a toggled `Switch`).

## Language
- Sentence case, short, no emoji, no exclamation marks, no "please".
- Name things the way the business does, the same word on the menu, the page title, the button and the toast.
- Errors say what happened and what to do: "This email is already used. Use another email or sign in." Not "Invalid input".
- Every string has `en` and `vi`; pass components their `labels`.

## Accessibility
- Every control has a visible label (or `hideLabel` with an `aria-label` when a column or heading names it).
- Colour is never the only signal: `StatusDot` has a text label, an invalid field has a message.
- Focus is always visible and returns to the trigger when an overlay closes; the components do this when mounted and unmounted as documented.
- Targets at least 24px, 44px on touch layouts; text contrast follows the tokens, so do not restyle text colours.
