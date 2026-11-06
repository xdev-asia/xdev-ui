# FileDrop

Drop zone and file chooser that checks type, size and count before handing files over, and lists the files being uploaded with progress and errors.

## Anatomy
`div.x-filedrop` > `label.x-filedrop-zone[data-over]` (icon, text, limits, `input[type=file].x-sr-only`) + `ul.x-filedrop-errors[role=alert]` + `ul.x-filedrop-list` > `li.x-filedrop-item` (name, size, `progress`, error, remove).

## Rules
- The zone is a `label` for a real file input, so Tab, Enter and Space open the chooser; `label` names it for screen readers.
- Say the limits: pass `accept` and `maxSize` (bytes) and the hint is built from them, or give `labels.limits`.
- `onFiles` gets only the files that pass `checkFiles`; the rest are listed under the zone with the reason and passed to `onReject`.
- FileDrop does not upload. The caller uploads, then passes `items` with `progress` (0 to 100) and `error`, and removes an item on `onRemove`.
- For one image with crop and preview use `ImageField` from `@xdev-asia/ui/image`.
- `checkFiles`, `matchesAccept` and `formatBytes` are exported for server-side or form validation.
