# Coachmark

A small card that points at one part of the screen with an arrow, used for the steps of a short product tour.

## Anatomy
`div.x-coachmark[role=dialog][data-placement]` > `span.x-coachmark-arrow`, `h2.x-coachmark-title`, `div.x-coachmark-body`, `div.x-coachmark-foot` > `StepDots` + `div.x-coachmark-actions` (Skip tour, Back, Next or Done).

## Rules
- Pass the anchor's `getBoundingClientRect()`; re-measure it on resize and when the step changes. A null anchor renders nothing, so end the tour when its target is gone.
- `placeCoachmark(anchor, size, viewport, placement)` is the pure placement: the preferred side when it fits, else the opposite side, else the preferred side, clamped into the viewport with `--x-space-2` (8px). Test it without a DOM.
- Non-modal: the page stays usable. Esc calls `onSkip`. Focus moves to Next on mount and on each step, and returns to the element that had it when the card closes.
- One primary button: Next, or Done on the last step. Back shows from step 2 on, when `onBack` is given. Skip tour is always there.
- Short copy: a title of a few words and one or two sentences of body. No images.
- Mount it at the root of the app, not inside a transformed parent, so `position: fixed` uses the viewport.
- At 360px the card is the viewport width minus the margin, and the buttons wrap under the dots.
