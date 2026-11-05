A review or conversation comment: avatar, author, optional bot and state badges, time, actions, an optional location line, the body and an optional footer.

## Rules
- `author` is required. It gives the avatar initials; the comment has no other identity.
- `children` is the body. Render user text through a sanitizing renderer (escaped HTML, inert links); never pass raw HTML.
- State is a tint: `state="resolved"` fades the body and `state="outdated"` sets a dashed 1px border. There is no coloured stripe. The badge text comes from `stateLabel`; without it, no badge shows.
- `bot` marks the author as an automation; the badge shows only when `botLabel` is given. Pass translated text, the component has no strings of its own.
- Put icon buttons or a menu trigger in `actions`, a file and line label in `location`, and a `ReactionBar` or a reply form in `footer`.
- The root is an `article`; give a list of comments a parent with a heading.
