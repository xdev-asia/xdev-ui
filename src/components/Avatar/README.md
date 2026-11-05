# Avatar

Round picture of a person, or their initials when there is no picture.

## Anatomy
`span.x-avatar[role=img][aria-label=name][data-size]` > `img.x-avatar-img[alt=""]` or `span.x-avatar-initials[aria-hidden]`. Sizes: `sm`, `md`, `lg` (tokens `--avatar-sm`, `--avatar-md`, `--avatar-lg` and `--type-avatar-*`). `avatarInitials(name)` is exported.

## Rules
- `name` is required: it gives the initials and the accessible label. The image itself has an empty `alt`.
- `src` should be a `data:` or same-origin URL; a page with a strict CSP cannot load a remote one. When it is missing or fails to load, the initials show.
- Initials are the first code point of the first and last words, upper-cased; `?` for an empty name.
- Sizes: `sm` 20px, `md` 32px, `lg` 48px (settings and profile pages).
- Neutral surface and text tokens only. The avatar carries no state: use a `StatusDot` beside it for presence.
