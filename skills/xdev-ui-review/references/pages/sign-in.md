# Page check: sign-in

**This page is a sign-in page when** it sits in `AuthShell`, or it is a step of signing in: the form, a two-step code, an OAuth consent, a device or desktop hand-off, or a magic-link landing.

Source rules: `xdev-ui-admin/references/sign-in.md`, `forms.md`.

## Auto (audit.mjs)
- `sign-in-shell`: an `AuthShell` with no `headline`, `actions` or `footer`, inline `actions` with no `ThemeSwitch`, a heading as the headline, or more than one `h1` in the file.
- `autocomplete`: a `password`, `email` or `tel` field with no `autoComplete`.
- `primary-count`, `label-voice`, `icon-button-name`.

## By hand
- [ ] **Frame.** The form pane holds the brand, the language `Select`, the `ThemeSwitch` (icon) and the form, and nothing else.
- [ ] **Widths.** From 1024px the showcase takes about five eighths of the width, its art centred with the headline and tagline under it and the footer at its foot. At 375px only the form shows, with the footer under it and no sideways scroll.
- [ ] **One title.** One `h1` ("Welcome back", "Sign in") with one muted line under it on what the account is for. No emoji and no exclamation mark.
- [ ] **One primary.** One full-width primary `Button`. Other ways in (another provider, a passkey, an email link, a token) are secondary, split by a short "or" line.
- [ ] **Art** is the product's own picture or the built-in pattern, in tokens, so it follows dark and light. It is never an illustration copied from another product.
- [ ] **Failure.** A failed sign-in shows a `Banner` above the form that says what to do, and keeps what the person typed. The submit button is disabled while the request runs.
- [ ] **Autofill.** `username` or `email`, `current-password`, `one-time-code` on code fields. A passkey prompt the person closes shows no error.
- [ ] **Every step.** The two-step, consent and hand-off steps use the same frame, keep the language and theme the person picked, and say what happens next.
- [ ] **Reload.** Reloading a signed-in page never flashes the sign-in form first.
