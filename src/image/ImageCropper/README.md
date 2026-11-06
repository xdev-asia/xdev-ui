# ImageCropper

Modal dialog that crops an image to a fixed ratio, with zoom, a quarter-turn rotation and reset. From `@xdev-asia/ui/image` (peer `react-easy-crop`).

## Anatomy
`div.dialog-backdrop[data-modal]` > `div.dialog.x-image-cropper[role=dialog]` > `h2.dialog-title` + `p.x-image-cropper-desc` + `div.x-image-cropper-stage` (react-easy-crop, crop frame named by `labels.area`) + `div.x-image-cropper-tools` (zoom `input[type=range]`, Rotate 90°, Reset) + `div.dialog-actions` (Cancel, Confirm).

## Rules
- Mount it to open it, with `key` set to the image, so zoom, rotation and position start fresh; unmount it on `onCancel` and `onConfirm`.
- `aspect` is width / height of the result. The frame ratio is fixed: give the field's ratio, not the photo's.
- `onConfirm(area, rotation)` gives the area in pixels of the rotated image; pass both to `cropToBlob` with the output size.
- `src` must be an object URL or a same-origin (or CORS-enabled) image, or the canvas cannot read it.
- After the image loads the crop frame takes focus: arrow keys move the image, the zoom slider zooms. Esc and Tab stop at this dialog, so it works inside a `FormDialog`.
- While `busy` every control is disabled and Esc and Cancel do nothing. A click on the backdrop never closes it.
- Prefer `ImageField`, which opens this dialog for you. `modal={false}` renders the markup only (previews).
