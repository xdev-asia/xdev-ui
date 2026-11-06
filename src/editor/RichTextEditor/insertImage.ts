import type { Editor } from "@tiptap/core";
import { loadImage, renameExtension, resizeToBlob } from "../../image/crop";

/** Image types the editor uploads; the file picker offers the same list. */
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const DEFAULT_MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const DEFAULT_IMAGE_MAX_WIDTH = 1600;

/** Why a file was refused, or null when it may be uploaded. Pure: reads only `type` and `size`. */
export function checkImageFile(file: { type: string; size: number }, maxBytes = DEFAULT_MAX_IMAGE_BYTES): "type" | "size" | null {
  if (!(IMAGE_TYPES as readonly string[]).includes(file.type)) return "type";
  if (file.size > maxBytes) return "size";
  return null;
}

/** The image files of a paste, drop or picker list (anything `image/*`; `checkImageFile` narrows further). */
export function imageFilesOf<F extends { type: string }>(list: ArrayLike<F> | null | undefined): F[] {
  return Array.from(list ?? []).filter((file) => file.type.startsWith("image/"));
}

function findImage(editor: Editor, src: string): { pos: number; attrs: Record<string, unknown> } | null {
  let found: { pos: number; attrs: Record<string, unknown> } | null = null;
  editor.state.doc.descendants((node, pos) => {
    if (found) return false;
    if (node.type.name === "image" && node.attrs.src === src) found = { pos, attrs: node.attrs };
    return !found;
  });
  return found;
}

export interface InsertImageOptions {
  upload: (file: File) => Promise<string>;
  /** Re-encode to WebP at most this wide before upload; 0 uploads the original file. */
  maxWidth: number;
  onStart: () => void;
  onEnd: () => void;
  onError: (error: unknown) => void;
}

/**
 * Puts the image into the document at once (dimmed, with a spinner), shrinks it to `maxWidth` WebP,
 * uploads it and swaps the `blob:` placeholder for the returned URL. A failed upload removes it again.
 * `onStart`/`onEnd` bracket the whole job so a form can lock its save button.
 */
export async function insertImageFile(editor: Editor, file: File, at: number | null, opts: InsertImageOptions): Promise<void> {
  const blobUrl = URL.createObjectURL(file);
  opts.onStart();
  try {
    editor
      .chain()
      .focus()
      .insertContentAt(at ?? editor.state.selection.to, { type: "image", attrs: { src: blobUrl, alt: "", uploading: true } })
      .run();
    try {
      let out = file;
      if (opts.maxWidth > 0) {
        const blob = await resizeToBlob(await loadImage(blobUrl), opts.maxWidth);
        out = new File([blob], renameExtension(file.name, "webp"), { type: blob.type || "image/webp" });
      }
      const url = await opts.upload(out);
      if (editor.isDestroyed) return;
      const target = findImage(editor, blobUrl);
      if (target) editor.view.dispatch(editor.state.tr.setNodeMarkup(target.pos, undefined, { ...target.attrs, src: url, uploading: false }));
    } catch (e) {
      if (editor.isDestroyed) return;
      const target = findImage(editor, blobUrl);
      if (target) editor.view.dispatch(editor.state.tr.delete(target.pos, target.pos + 1));
      opts.onError(e);
    }
  } finally {
    URL.revokeObjectURL(blobUrl);
    opts.onEnd();
  }
}
