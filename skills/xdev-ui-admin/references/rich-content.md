# Rich content: editor and images

Both live in subpaths so apps without them do not install their peers.

```bash
pnpm add @tiptap/core @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link @tiptap/extensions @tiptap/markdown   # /editor
pnpm add react-easy-crop                                                                                                                               # /image
```

## RichTextEditor

```tsx
import { RichTextEditor } from "@xdev-asia/ui/editor";

<RichTextEditor label={t("post.body")} value={draft.body} onChange={(body) => setDraft({ ...draft, body })}
  onUploadImage={uploadImage} onUploadingChange={setUploading} labels={ui.editor} />
```

- Stores Markdown by default (`format="html"` for HTML). Content is limited to the toolbar: headings 2 and 3, bold, italic, lists, quote, `http(s)` links, images.
- Controlled: replacing `value` (record loaded, form reset) replaces the content; echoing `onChange` does not.
- Images exist only with `onUploadImage(file) => Promise<url>`; wide images are re-encoded to WebP at 1600px before upload. Disable Save while `onUploadingChange(true)`.
- Render stored Markdown on the public site with the same rules (sanitise; allow only `http(s)` links).

## ImageField

```tsx
import { ImageField } from "@xdev-asia/ui/image";

<ImageField label={t("banner.image")} aspect={{ ratio: 16 / 9, width: 1600, height: 900 }} value={draft.imageUrl}
  onChange={(url) => setDraft({ ...draft, imageUrl: url })} onUpload={(blob, name) => api.upload(blob, name)}
  onBusyChange={setUploading} labels={ui.imageField} />
```

- `aspect` is the crop ratio and the exported size; output is WebP 0.85 unless `encode` says otherwise.
- Pick, crop (`ImageCropper`), upload; "Crop again" restarts from the original photo while `value` is still the uploaded URL.
- A `value` from another origin needs CORS for "Crop again".
- For several files or non-images use `FileDrop`. Helpers `cropToBlob`, `resizeToBlob`, `sameAspect` are exported for custom flows.
