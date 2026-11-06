// @xdev-asia/ui/editor: rich text editing on Tiptap 3 (optional peers @tiptap/*).
// Not exported from the core entry, so apps without Tiptap never load it.
export { RichTextEditor, type RichTextEditorProps, type RichTextFormat } from "./RichTextEditor/RichTextEditor";
export { DEFAULT_LABELS as RICH_TEXT_EDITOR_LABELS, type RichTextEditorLabels } from "./RichTextEditor/labels";
export { editorExtensions, isSafeUrl, type EditorExtensionOptions } from "./RichTextEditor/extensions";
export { checkImageFile } from "./RichTextEditor/insertImage";
