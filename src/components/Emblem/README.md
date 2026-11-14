# Emblem

Rounded square that stands for one thing (a provider, an integration, a tool): its logo, an icon, or its letters on a tint of its own colour.

## Anatomy
`span.x-emblem[data-size]` (`role="img"`, named by `name`) > `img.x-emblem-img` | `svg` | `.x-emblem-text`. The colour arrives as `--x-emblem-color`.

## Rules
- Use it where many things of one kind sit side by side (a grid of `ResourceCard`, a list) so each can be told apart at a glance. A person is an `Avatar`; a state is a `StatusDot`.
- `color` is the thing's own colour, from data. It is the one place a colour that is not a token is allowed; never hard-code it in a stylesheet.
- The tile is a tint, so any colour stays readable in dark and light. A colour close to the surface (white, near-black) gives a neutral tile.
- Letters: one to three, upper case, no emoji. A logo (`src`) replaces them, on a white plate in both themes: logos are drawn for a light ground.
- The mark never carries state. Say the state in words beside it.
