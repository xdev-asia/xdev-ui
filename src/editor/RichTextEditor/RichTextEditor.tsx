import type { Editor } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/react";
import { useCallback, useEffect, useId, useMemo, useRef, useState, type CSSProperties, type JSX } from "react";
import { formatBytes } from "../../components/FileDrop/FileDrop";
import { cx } from "../../internal/cx";
import { EditorToolbar } from "./EditorToolbar";
import { editorExtensions } from "./extensions";
import { ImageBar } from "./ImageBar";
import { checkImageFile, DEFAULT_IMAGE_MAX_WIDTH, DEFAULT_MAX_IMAGE_BYTES, imageFilesOf, insertImageFile } from "./insertImage";
import { DEFAULT_LABELS, type RichTextEditorLabels } from "./labels";

export type RichTextFormat = "markdown" | "html";

export interface RichTextEditorProps {
  /** Visible label above the editor. Without it, pass `aria-label`. */
  label?: string;
  "aria-label"?: string;
  /** Keep `label` for screen readers only (e.g. a tab above already names the editor). */
  hideLabel?: boolean;
  /** Controlled content in `format`. */
  value: string;
  /** Gets the content in `format`. Held back while an image uploads, then sent once. */
  onChange: (value: string) => void;
  /** Default "markdown". */
  format?: RichTextFormat;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  "aria-describedby"?: string;
  /** Minimum height of the writing area: a number is px, a string any CSS length. Default 240px. */
  minHeight?: number | string;
  /** Uploads one image and resolves to the URL to store. Absent: no image button, pasted and dropped files are ignored. */
  onUploadImage?: (file: File) => Promise<string>;
  /** True while at least one image uploads; lock the form's save button with it. */
  onUploadingChange?: (busy: boolean) => void;
  /** Upload or validation failures. Absent: the editor shows `labels.uploadFailed` / `labels.imageInvalid` itself. */
  onUploadError?: (error: unknown, file: File) => void;
  /** Images wider than this are re-encoded to WebP at this width before upload; 0 uploads the original. Default 1600. */
  imageMaxWidth?: number;
  /** Largest accepted image file. Default 10 MB. */
  imageMaxBytes?: number;
  /** Maps a stored image `src` to the URL the browser loads (e.g. a proxy path). Display only. */
  resolveImageSrc?: (src: string) => string;
  /** Override the English defaults (e.g. for vi). */
  labels?: Partial<RichTextEditorLabels>;
  className?: string;
}

const read = (editor: Editor, format: RichTextFormat): string => (format === "html" ? editor.getHTML() : editor.getMarkdown());

/** CSS length of `minHeight`. */
export function minHeightValue(minHeight: number | string | undefined): string | undefined {
  if (minHeight == null) return undefined;
  return typeof minHeight === "number" ? `${minHeight}px` : minHeight;
}

/**
 * Article editor on Tiptap 3: headings 2-3, bold, italic, links, lists, quotes and images.
 * Controlled; reads and writes Markdown (default) or HTML. SSR-safe: renders an empty frame on the
 * server and creates the editor after hydration.
 */
export function RichTextEditor({
  label,
  "aria-label": ariaLabel,
  hideLabel = false,
  value,
  onChange,
  format = "markdown",
  placeholder,
  disabled = false,
  invalid = false,
  "aria-describedby": describedBy,
  minHeight,
  onUploadImage,
  onUploadingChange,
  onUploadError,
  imageMaxWidth = DEFAULT_IMAGE_MAX_WIDTH,
  imageMaxBytes = DEFAULT_MAX_IMAGE_BYTES,
  resolveImageSrc,
  labels,
  className,
}: RichTextEditorProps): JSX.Element {
  const l: RichTextEditorLabels = { ...DEFAULT_LABELS, ...labels };
  const labelId = `x-editor-${useId()}`;
  const errorId = `${labelId}-error`;
  const [linkOpen, setLinkOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const editorRef = useRef<Editor | null>(null);
  const pending = useRef(0);
  // The value last handed to the parent (or loaded from it): tells "parent replaced the value"
  // from "parent echoed what we just emitted".
  const lastValue = useRef(value);
  const props = useRef({ onChange, onUploadingChange, onUploadError, onUploadImage, format, placeholder, resolveImageSrc, l, imageMaxWidth, imageMaxBytes, disabled });
  props.current = { onChange, onUploadingChange, onUploadError, onUploadImage, format, placeholder, resolveImageSrc, l, imageMaxWidth, imageMaxBytes, disabled };

  const emit = useCallback((editor: Editor) => {
    if (editor.isDestroyed) return;
    const out = read(editor, props.current.format);
    lastValue.current = out;
    props.current.onChange(out);
  }, []);

  const upload = useCallback(
    (files: File[], at: number | null) => {
      const editor = editorRef.current;
      const p = props.current;
      if (!editor || !p.onUploadImage || p.disabled) return;
      let position = at;
      for (const file of files) {
        const problem = checkImageFile(file, p.imageMaxBytes);
        if (problem) {
          if (p.onUploadError) p.onUploadError(new Error(problem), file);
          else setUploadError(p.l.imageInvalid(formatBytes(p.imageMaxBytes)));
          continue;
        }
        setUploadError(null);
        const doUpload = p.onUploadImage;
        void insertImageFile(editor, file, position, {
          upload: doUpload,
          maxWidth: p.imageMaxWidth,
          onStart: () => {
            if (pending.current++ === 0) props.current.onUploadingChange?.(true);
          },
          onEnd: () => {
            if (--pending.current === 0) {
              // Edits made while uploading were held back (they held a blob: URL); send them now.
              emit(editor);
              props.current.onUploadingChange?.(false);
            }
          },
          onError: (e) => {
            if (props.current.onUploadError) props.current.onUploadError(e, file);
            else setUploadError(props.current.l.uploadFailed);
          },
        });
        position = null; // further images follow the first one at the cursor
      }
    },
    [emit],
  );

  const extensions = useMemo(
    () =>
      editorExtensions({
        placeholder: () => props.current.placeholder ?? "",
        resolveSrc: (src) => props.current.resolveImageSrc?.(src) ?? src,
        uploadingLabel: () => props.current.l.uploading,
      }),
    [],
  );

  // Attributes of the contenteditable follow the props.
  const textboxAttrs = useMemo(() => {
    const a: Record<string, string> = { class: "x-editor-content", role: "textbox", "aria-multiline": "true" };
    if (label) a["aria-labelledby"] = labelId;
    else if (ariaLabel) a["aria-label"] = ariaLabel;
    const described = [describedBy, uploadError ? errorId : undefined].filter(Boolean).join(" ");
    if (described) a["aria-describedby"] = described;
    if (invalid) a["aria-invalid"] = "true";
    if (disabled) a["aria-disabled"] = "true";
    return a;
  }, [label, ariaLabel, labelId, describedBy, uploadError, errorId, invalid, disabled]);

  const editor = useEditor({
    extensions,
    content: value,
    contentType: format,
    editable: !disabled,
    immediatelyRender: false,
    editorProps: {
      attributes: textboxAttrs,
      handleKeyDown: (_view, event) => {
        if ((event.metaKey || event.ctrlKey) && !event.shiftKey && !event.altKey && event.key.toLowerCase() === "k") {
          event.preventDefault();
          setLinkOpen(true);
          return true;
        }
        return false;
      },
      handleDrop: (view, event, _slice, moved) => {
        const files = imageFilesOf(event.dataTransfer?.files);
        if (moved || files.length === 0 || !props.current.onUploadImage) return false;
        event.preventDefault();
        upload(files, view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos ?? null);
        return true;
      },
      handlePaste: (_view, event) => {
        const files = imageFilesOf(event.clipboardData?.files);
        if (files.length === 0 || !props.current.onUploadImage) return false;
        event.preventDefault();
        upload(files, null);
        return true;
      },
    },
    onUpdate: ({ editor: e }) => {
      if (pending.current === 0) emit(e);
    },
  });

  useEffect(() => {
    editorRef.current = editor;
    return () => {
      editorRef.current = null;
    };
  }, [editor]);

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    editor.setOptions({ editorProps: { ...editor.options.editorProps, attributes: textboxAttrs } });
  }, [editor, textboxAttrs]);

  useEffect(() => {
    if (editor && !editor.isDestroyed && editor.isEditable === disabled) editor.setEditable(!disabled, false);
    if (disabled) setLinkOpen(false);
  }, [editor, disabled]);

  // The parent replaced the value (form reset, record loaded): show it.
  useEffect(() => {
    if (!editor || value === lastValue.current) return;
    lastValue.current = value;
    editor.commands.setContent(value, { contentType: format, emitUpdate: false });
  }, [editor, value, format]);

  const style = minHeight != null ? ({ "--editor-min-height": minHeightValue(minHeight) } as CSSProperties) : undefined;

  return (
    <div className={cx("x-editor", className)} data-invalid={invalid ? "" : undefined} data-disabled={disabled ? "" : undefined} style={style}>
      {label ? (
        <span id={labelId} className={hideLabel ? "x-sr-only" : "x-editor-label"}>
          {label}
        </span>
      ) : null}
      <div className="x-editor-frame">
        {editor ? (
          <>
            <div className="x-editor-bars">
              <EditorToolbar
                editor={editor}
                labels={l}
                linkOpen={linkOpen}
                onLinkOpenChange={setLinkOpen}
                onPickImages={onUploadImage ? (files) => upload(files, null) : undefined}
                disabled={disabled}
              />
              <ImageBar editor={editor} labels={l} disabled={disabled} />
            </div>
            <EditorContent editor={editor} />
          </>
        ) : (
          <div className="x-editor-content" aria-busy="true" />
        )}
      </div>
      {uploadError ? (
        <small id={errorId} className="x-editor-error" role="alert">
          {uploadError}
        </small>
      ) : null}
    </div>
  );
}
