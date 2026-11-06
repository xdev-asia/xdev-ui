# RichTextEditor

Article editor on Tiptap 3, from `@xdev-asia/ui/editor` (peers `@tiptap/*`). It offers headings 2-3, bold, italic, links, bulleted and numbered lists, quotes and images, and nothing more. It is controlled and reads and writes Markdown by default (`format="html"` for HTML). It renders an empty frame on the server and creates the editor after hydration.

## Anatomy
`div.x-editor` > label + `div.x-editor-frame` > `div.x-editor-bars` (`div.x-editor-toolbar[role=toolbar]`, `div.x-editor-imagebar` while an image is selected) + `div.x-editor-content[role=textbox]`; `small.x-editor-error[role=alert]` below on an upload error.

## Rules
- Controlled: keep `value` in the caller and save what `onChange` sends. Replacing `value` (form reset, record loaded) replaces the content; echoing what `onChange` sent does not.
- Name it with `label`, or `aria-label` when a heading or tab already names it. `hideLabel` keeps `label` for screen readers only.
- Content is limited to what the toolbar can make. Stored or pasted headings 1 and 4-6 become 2 and 3; underline, strike, code and rules are dropped; links other than `http://` and `https://` keep their text and lose the link.
- Images exist only with `onUploadImage(file) => Promise<url>`. Without it the image button is hidden and pasted or dropped files are ignored. JPG, PNG and WebP up to `imageMaxBytes` (10 MB) are accepted; wider than `imageMaxWidth` (1600) they are re-encoded to WebP at that width first.
- While images upload, `onChange` is held back (the content holds temporary `blob:` URLs) and sent once at the end; `onUploadingChange(true|false)` lets the form lock its save button.
- Upload failures go to `onUploadError`; without it the editor shows `labels.uploadFailed` or `labels.imageInvalid` below the frame.
- `resolveImageSrc` changes only the URL the browser loads (e.g. a proxy path); the stored `src` stays what the upload returned.
- Toolbar: one Tab stop, arrow keys, Home and End move between tools; toggles carry `aria-pressed`. Ctrl/Cmd+K opens the link form; an address is accepted only with `http://` or `https://`.
- Select an image to edit its description (alt text) or remove it.
- `invalid` turns the border to `--danger` and sets `aria-invalid`; point `aria-describedby` at the field message.
- Pass `labels` for other languages; every key has an English default (`RICH_TEXT_EDITOR_LABELS`).
