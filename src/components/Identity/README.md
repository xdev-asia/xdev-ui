# Identity

A person at a glance: their avatar, name and one muted line such as the email, for profile and account pages.

## Anatomy

`div.x-identity[data-size]` > `span.x-identity-avatar[aria-hidden]` > `Avatar`, then `span.x-identity-text` > `strong.x-identity-name` + optional `span.x-identity-detail`.

## Rules

- `name` is required; `detail` is one line (email, handle or role), never a sentence.
- The avatar is hidden from screen readers because the name is written beside it.
- Size `lg` on a profile or account page, `md` inside a list row's `leading` slot or a menu.
- Long names and emails wrap rather than overflow at 360px.
- Presence or plan goes next to it as a `StatusDot` or `Tag`, not as a colour on the avatar.
