# SortableList

Vertical list the user reorders by dragging a grip handle, or with the keyboard. Controlled: it renders `items` and reports each finished move with `onReorder(from, to)`; the caller applies it (with `moveItem`).

## Anatomy
`ul.x-sortable[aria-label]` > `li.x-sortable-item` (carries `data-lifted`, `data-dragging` and `data-drop="before|after"` for the drop line) holding what `renderItem(item, index, handle)` returns. `handle` is `button.x-sortable-handle` with a grip icon; place it where it belongs in the row (usually first). A visually hidden `[role=status][aria-live=polite]` follows the list.

## Usage
```tsx
<SortableList
  items={steps}
  getKey={(s) => s.id}
  getLabel={(s) => s.title}
  label="Onboarding steps"
  onReorder={(from, to) => setSteps(moveItem(steps, from, to))}
  renderItem={(s, i, handle) => (
    <>
      {handle}
      <span>{s.title}</span>
    </>
  )}
/>
```

## Rules
- Keyboard: focus a handle, Space or Enter lifts the item, ArrowUp/ArrowDown (Home/End) move it, Space or Enter drops it, Escape (or moving focus away) puts it back. Each step is announced in the live region.
- Pointer: drag the handle; the item lands at the drop line. Only the handle starts a drag, so text in the row stays selectable.
- `getLabel` names the item in the handle label and announcements (default: its key). Always pass it when keys are ids.
- `disabled`, or fewer than two items, disables every handle. Do not offer reorder on a sorted or filtered view.
- Uses the same helpers as `DataTable` reorder: `moveItem`, `reorderKeyStep`, `reorderSlot`, `slotToIndex`.
- `labels` (`SortableListLabels`: `handle(name)`, `lifted(name)`, `moved(pos, total)`, `dropped(pos, total)`, `cancelled`) overrides the English defaults.
