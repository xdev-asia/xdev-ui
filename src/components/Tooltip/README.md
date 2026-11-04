# Tooltip

Short text label that appears on hover or focus of one control and describes it.

## Anatomy
`span.x-tooltip-anchor` > child (gets `aria-describedby`) + `span.x-tooltip[role=tooltip][data-placement]`.

## Rules
- Supplements a control; never the only place for needed information. Icon-only buttons still need `IconButton`'s `label`.
- Plain text, one line, under about 60 characters; a `Kbd` hint is fine. No links or buttons; use a `Popover` for that.
- Wrap exactly one focusable child; it shows on hover and on keyboard focus, and Escape hides it.
- The tip is always in the DOM so `aria-describedby` resolves; it fades in with opacity, none under reduced motion.
- Do not put a tooltip on disabled controls; they cannot take focus.
