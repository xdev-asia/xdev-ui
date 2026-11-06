# Popover

Small non-modal panel anchored to a button, such as the notification bell or a quick-change picker.

## Anatomy
`span.x-popover-anchor` > trigger + (open) `div.ws-menu-backdrop` + `div.x-popover[role=dialog][data-placement]`.

## Rules
- For short content tied to one button. A list of commands is a `Menu`; a decision that blocks the app is a `Dialog`.
- Controlled: keep `open` in the caller; `onClose` fires on Escape and on a click outside.
- Pass `trigger` as a function and spread its props on the button, so it gets `aria-expanded`, `aria-controls` and `aria-haspopup`.
- Focus moves into the panel on open and returns to the trigger on close.
- Name the panel with `label` ("Notifications").
- The panel renders into `document.body` once mounted (`position: fixed`, placed from the anchor box, flips above when there is no room below), so a scrolling table or a clipped card cannot cut it off. `portal={false}` keeps it inside the anchor; the server render is always inline.
- `--bg-2` surface, 1px `--line` border, `--shadow-menu`; it enters with opacity and a 4px transform, none under reduced motion.
