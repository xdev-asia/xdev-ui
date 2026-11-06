import { useEffect, useId, useRef, useState, type ChangeEvent, type DragEvent, type JSX, type ReactNode } from "react";
import { cx } from "../../internal/cx";
import { Button } from "../../components/Button/Button";
import { Icon } from "../../components/Icon/Icon";
import { Spinner } from "../../components/Spinner/Spinner";
import { checkFiles, formatBytes, type FileRejectReason } from "../../components/FileDrop/FileDrop";
import { cropToBlob, loadImage, renameExtension, type CropArea, type EncodeOptions, type ImageAspect } from "../crop";
import { ImageCropper, type ImageCropperLabels } from "../ImageCropper/ImageCropper";

export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";
export const IMAGE_MAX_SIZE = 10 * 1024 * 1024;

/** The image the user picked, kept so "Crop again" starts from it, tied to the value its upload produced. */
export type KeptOriginal = { url: string; value: string };

/** The image "Crop again" opens: the kept original when the field still shows what it produced, else the value. */
export function recropSource(kept: KeptOriginal | null, value: string | null | undefined): string | null {
  if (!value) return null;
  return kept && kept.value === value ? kept.url : value;
}

/**
 * After a successful upload: which original to keep and which object URLs to revoke. `result` is what `onUpload`
 * resolved to; only a string ties the original to the new value.
 */
export function afterUpload(
  kept: KeptOriginal | null,
  source: { url: string; fresh: boolean },
  result: unknown,
): { kept: KeptOriginal | null; revoke: string[] } {
  const next = typeof result === "string" && result ? { url: source.url, value: result } : null;
  const revoke: string[] = [];
  if (kept && kept.url !== next?.url) revoke.push(kept.url);
  if (source.fresh && !next && !revoke.includes(source.url)) revoke.push(source.url);
  return { kept: next, revoke };
}

/** Object URLs the field created; `revoke` touches only those, `revokeAll` runs on unmount. */
export function urlTracker(
  create: (blob: Blob) => string = (b) => URL.createObjectURL(b),
  release: (url: string) => void = (u) => URL.revokeObjectURL(u),
): { create: (blob: Blob) => string; revoke: (url: string | null | undefined) => void; revokeAll: () => void } {
  const urls = new Set<string>();
  return {
    create(blob) {
      const url = create(blob);
      urls.add(url);
      return url;
    },
    revoke(url) {
      if (url && urls.delete(url)) release(url);
    },
    revokeAll() {
      for (const url of urls) release(url);
      urls.clear();
    },
  };
}

/** "JPEG, PNG, WEBP" from "image/jpeg,image/png,.webp". */
export function describeAccept(accept: string): string {
  return accept
    .split(",")
    .map((r) => r.trim().replace(/^image\//, "").replace(/^\./, "").toUpperCase())
    .filter(Boolean)
    .join(", ");
}

/** File name for the upload: the picked name with the extension of the encoded type. */
export function outputName(name: string, type = "image/webp"): string {
  const sub = type.split("/")[1] ?? "webp";
  return renameExtension(name, sub === "jpeg" ? "jpg" : sub);
}

export interface ImageFieldLabels {
  /** The empty zone's main line. */
  drop: string;
  /** The link-styled part of it. */
  browse: string;
  /** Hint in the empty zone, from the formats and the size limit. */
  limits: (formats: string, maxSize: string | undefined) => string;
  rejected: (name: string, reason: FileRejectReason, maxSize: string | undefined) => string;
  /** Shown when `onUpload` rejects with something that is not an `Error` with a message. */
  failed: string;
  uploading: string;
  recrop: string;
  replace: string;
  remove: string;
  /** Passed to the crop dialog. */
  cropper: Partial<ImageCropperLabels>;
}

const DEFAULT_LABELS: ImageFieldLabels = {
  drop: "Drop an image here or",
  browse: "browse",
  limits: (formats, max) => [formats, max ? `up to ${max}` : ""].filter(Boolean).join(", "),
  rejected: (name, reason, max) =>
    reason === "type" ? `${name}: this file type is not accepted` : reason === "size" ? `${name} is larger than ${max ?? "the limit"}` : `${name}: drop one image`,
  failed: "The image could not be uploaded",
  uploading: "Uploading image",
  recrop: "Crop again",
  replace: "Replace",
  remove: "Remove",
  cropper: {},
};

export interface ImageFieldProps {
  label: ReactNode;
  /** Crop ratio and the exported size in pixels. */
  aspect: ImageAspect;
  /** URL of the current image (shown as the preview), or null. */
  value: string | null | undefined;
  /** Called with the URL `onUpload` resolved to, and with null on Remove. */
  onChange: (value: string | null) => void;
  /**
   * Uploads the cropped image. Resolve to the new URL to have it passed to `onChange` (and "Crop again" start from the
   * picked original); resolve to nothing to update `value` yourself. Reject to show the error under the field.
   */
  onUpload: (blob: Blob, name: string) => Promise<string | void>;
  /** True from the crop until the upload settles; lock the form's submit while true. */
  onBusyChange?: (busy: boolean) => void;
  accept?: string;
  /** Bytes. Default 10 MB. */
  maxSize?: number;
  /** Output type and quality; WebP 0.85 by default. */
  encode?: EncodeOptions;
  required?: boolean;
  disabled?: boolean;
  hint?: ReactNode;
  /** A validation message from the form; the field's own errors (wrong file, failed upload) take its place. */
  error?: ReactNode;
  /** Extra buttons next to the field's own ("Choose from library"). */
  actions?: ReactNode;
  labels?: Partial<ImageFieldLabels>;
  className?: string;
}

type Source = { url: string; name: string; fresh: boolean };

/**
 * One image with a fixed ratio: pick or drop a file, crop it in `ImageCropper`, upload the result through `onUpload`
 * and show it. It stores nothing itself.
 */
export function ImageField({
  label,
  aspect,
  value,
  onChange,
  onUpload,
  onBusyChange,
  accept = IMAGE_ACCEPT,
  maxSize = IMAGE_MAX_SIZE,
  encode,
  required,
  disabled,
  hint,
  error,
  actions,
  labels,
  className,
}: ImageFieldProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  const id = useId();
  const inputId = `x-image-field-${id}`;
  const labelId = `${inputId}-label`;
  const noteId = `${inputId}-note`;
  const [over, setOver] = useState(false);
  const [source, setSource] = useState<Source | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const input = useRef<HTMLInputElement | null>(null);
  const urls = useRef<ReturnType<typeof urlTracker> | null>(null);
  urls.current ??= urlTracker();
  const kept = useRef<KeptOriginal | null>(null);
  const mounted = useRef(true);
  const busy = useRef(false);
  const busyCallback = useRef(onBusyChange);
  useEffect(() => {
    busyCallback.current = onBusyChange;
  });
  useEffect(() => {
    mounted.current = true;
    const tracked = urls.current;
    return () => {
      mounted.current = false;
      tracked?.revokeAll();
      // Unmounted mid-upload: release the caller's lock, the upload no longer reports it.
      if (busy.current) busyCallback.current?.(false);
    };
  }, []);

  const uploading = uploadPreview !== null;
  const locked = disabled || uploading;
  const maxLabel = formatBytes(maxSize);
  const setBusy = (next: boolean): void => {
    busy.current = next;
    busyCallback.current?.(next);
  };

  const take = (files: FileList | readonly File[] | null | undefined): void => {
    const file = files?.[0];
    if (!file || locked) return;
    const { rejected } = checkFiles([file], { accept, maxSize });
    if (rejected.length) {
      setProblem(l.rejected(file.name, rejected[0].reason, maxLabel));
      return;
    }
    setProblem(null);
    setSource({ url: urls.current!.create(file), name: file.name, fresh: true });
  };

  const cancel = (): void => {
    if (source?.fresh) urls.current!.revoke(source.url);
    setSource(null);
  };

  const confirm = async (area: CropArea, rotation: number): Promise<void> => {
    const current = source;
    if (!current) return;
    setSource(null);
    setProblem(null);
    setBusy(true);
    let preview: string | null = null;
    try {
      const image = await loadImage(current.url);
      const blob = await cropToBlob(image, area, rotation, aspect, encode);
      if (!mounted.current) return;
      preview = urls.current!.create(blob);
      setUploadPreview(preview);
      const result = await onUpload(blob, outputName(current.name, encode?.type));
      if (!mounted.current) return;
      const next = afterUpload(kept.current, current, result);
      kept.current = next.kept;
      next.revoke.forEach((u) => urls.current!.revoke(u));
      if (typeof result === "string" && result) onChange(result);
    } catch (e) {
      if (current.fresh) urls.current!.revoke(current.url);
      if (mounted.current) setProblem(e instanceof Error && e.message ? e.message : l.failed);
    } finally {
      urls.current!.revoke(preview);
      if (mounted.current) {
        setUploadPreview(null);
        setBusy(false);
      }
    }
  };

  const recrop = (): void => {
    const url = recropSource(kept.current, value);
    if (url) setSource({ url, name: "image", fresh: false });
  };

  const remove = (): void => {
    setProblem(null);
    urls.current!.revoke(kept.current?.url);
    kept.current = null;
    onChange(null);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    if (!locked) setOver(true);
  };
  const onDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setOver(false);
    take(e.dataTransfer.files);
  };

  const preview = uploadPreview ?? value ?? null;
  const note = problem ?? error;
  const hintText = l.limits(describeAccept(accept), maxLabel);
  return (
    <div
      className={cx("x-image-field", className)}
      data-over={over ? "true" : undefined}
      data-disabled={disabled ? "true" : undefined}
      data-invalid={note ? "true" : undefined}
      onDragOver={onDragOver}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
    >
      <span className="x-image-field-label" id={labelId}>
        {label}
        {required ? (
          <span className="x-image-field-required" aria-hidden="true">
            *
          </span>
        ) : null}
      </span>
      {hint ? <small className="x-image-field-hint">{hint}</small> : null}
      <input
        ref={input}
        id={inputId}
        className="x-sr-only"
        type="file"
        accept={accept}
        disabled={locked}
        aria-required={required ? true : undefined}
        aria-labelledby={labelId}
        aria-describedby={note ? noteId : undefined}
        aria-invalid={note ? true : undefined}
        tabIndex={preview ? -1 : undefined}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          take(e.currentTarget.files);
          e.currentTarget.value = "";
        }}
      />
      {preview ? (
        <>
          <div className="x-image-field-preview" style={{ aspectRatio: aspect.ratio }} data-busy={uploading ? "true" : undefined}>
            <img src={preview} alt="" />
            {uploading ? <Spinner size="md" label={l.uploading} className="x-image-field-spinner" /> : null}
          </div>
          <div className="x-image-field-actions">
            <Button variant="secondary" icon="edit" disabled={locked} onClick={recrop}>
              {l.recrop}
            </Button>
            <Button variant="secondary" icon="upload" disabled={locked} onClick={() => input.current?.click()}>
              {l.replace}
            </Button>
            {actions}
            <Button variant="secondary" icon="trash" disabled={locked} onClick={remove}>
              {l.remove}
            </Button>
          </div>
        </>
      ) : (
        <>
          <label className="x-image-field-zone" htmlFor={inputId} style={{ aspectRatio: aspect.ratio }}>
            <Icon name="image" size={20} />
            <span>
              {l.drop} <span className="x-image-field-browse">{l.browse}</span>
            </span>
            {hintText ? <small>{hintText}</small> : null}
          </label>
          {actions ? <div className="x-image-field-actions">{actions}</div> : null}
        </>
      )}
      {note ? (
        <p className="x-image-field-error" id={noteId} role="alert">
          {note}
        </p>
      ) : null}
      {source ? (
        <ImageCropper key={source.url} src={source.url} aspect={aspect.ratio} labels={l.cropper} onCancel={cancel} onConfirm={(a, r) => void confirm(a, r)} />
      ) : null}
    </div>
  );
}
