# SplitHandle

Draggable, keyboard-operable divider that resizes the panel next to it.

## Anatomy
`div.ws-handle.x-split-handle[role=separator][data-direction]`: a 1px `--line` rule inside a wider hit area.

## Rules
- The caller owns the size: keep `value` in state and set it from `onResize`. Values are clamped to `min`/`max`.
- `direction="horizontal"` resizes a width (sidebar, file tree); `"vertical"` resizes a height (terminal dock).
- Set `reverse` when the resized panel sits after the handle (right or bottom).
- Keys: arrows step by `step` px (Shift x4), Home/End jump to min/max. Pointer drag follows the cursor.
- Name it after the panel with `label` ("Resize file tree"); default `labels.resize`.
- The rule turns `--x-color-signal` on hover, drag and focus; no other decoration.
