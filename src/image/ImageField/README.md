# ImageField

One image with a fixed ratio: pick or drop a file, crop it in `ImageCropper`, upload the result and show it, with Crop again, Replace and Remove. From `@xdev-asia/ui/image` (peer `react-easy-crop`).

## Anatomy
`div.x-image-field[data-over][data-invalid][data-disabled]` > `span.x-image-field-label` + `small.x-image-field-hint` + `input[type=file].x-sr-only` + either `label.x-image-field-zone` (empty) or `div.x-image-field-preview` > `img` (+ `Spinner` while uploading) + `div.x-image-field-actions` (Crop again, Replace, `actions`, Remove), then `p.x-image-field-error[role=alert]` and the `ImageCropper` while open.

## Rules
- `aspect` is `{ ratio, width, height }`: the crop ratio and the exported size in pixels. The output is WebP 0.85 unless `encode` says otherwise.
- The field stores nothing. `onUpload(blob, name)` uploads; resolve to the new URL and it goes to `onChange`, or resolve to nothing and set `value` yourself (for example from an id). `value` is the URL shown as the preview.
- Resolving to the URL also lets Crop again start from the picked photo instead of the cropped file, as long as `value` is still that URL.
- Files are checked with `checkFiles` (`accept`, default JPEG, PNG, WebP; `maxSize`, default 10 MB). A file can be dropped anywhere on the field; only the first one is used.
- A wrong file or a failed upload is shown under the field (`role=alert`), in place of the form's `error`. A rejected `onUpload` shows the `Error` message, else `labels.failed`.
- Lock the form's submit while `onBusyChange` reports true (from Confirm until the upload settles).
- A `value` on another origin must allow CORS for Crop again to work.
- Put a library picker or other source in `actions`. For several files or non-image files use `FileDrop`.
