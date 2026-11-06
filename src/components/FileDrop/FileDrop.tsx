import { useId, useState, type ChangeEvent, type DragEvent, type JSX, type ReactNode } from "react";
import { cx } from "../../internal/cx";
import { Icon } from "../Icon/Icon";
import { IconButton } from "../IconButton/IconButton";

/** The part of `File` FileDrop reads; lets the checks run without a DOM. */
export interface FileLike {
  name: string;
  size: number;
  type: string;
}

export type FileRejectReason = "type" | "size" | "count";

export interface FileRejection<F extends FileLike = File> {
  file: F;
  reason: FileRejectReason;
}

/** True when `file` matches an `accept` list ("image/*,.pdf,application/zip"); an empty list accepts all. */
export function matchesAccept(file: FileLike, accept: string | undefined): boolean {
  const rules = (accept ?? "").split(",").map((r) => r.trim().toLowerCase()).filter(Boolean);
  if (rules.length === 0) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return rules.some((r) => (r.startsWith(".") ? name.endsWith(r) : r.endsWith("/*") ? type.startsWith(r.slice(0, -1)) : type === r));
}

/** Splits picked files into accepted and rejected, in order: wrong type, too big, then over the count limit. */
export function checkFiles<F extends FileLike>(
  files: readonly F[],
  opts: { accept?: string; maxSize?: number; multiple?: boolean; maxFiles?: number },
): { accepted: F[]; rejected: FileRejection<F>[] } {
  const limit = opts.multiple ? (opts.maxFiles ?? Infinity) : 1;
  const accepted: F[] = [];
  const rejected: FileRejection<F>[] = [];
  for (const file of files) {
    if (!matchesAccept(file, opts.accept)) rejected.push({ file, reason: "type" });
    else if (opts.maxSize != null && file.size > opts.maxSize) rejected.push({ file, reason: "size" });
    else if (accepted.length >= limit) rejected.push({ file, reason: "count" });
    else accepted.push(file);
  }
  return { accepted, rejected };
}

/** "512 B", "1.4 KB", "3.2 MB" (base 1024). */
export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  const units = ["KB", "MB", "GB"];
  let v = n / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v < 10 ? v.toFixed(1) : Math.round(v)} ${units[i]}`;
}

/** A file shown in the list under the drop zone (uploaded, uploading or failed). */
export interface FileDropItem {
  id: string;
  name: string;
  size?: number;
  /** 0 to 100 while uploading. */
  progress?: number;
  error?: ReactNode;
}

export interface FileDropLabels {
  /** The zone's main line. */
  drop: string;
  /** The link-styled part that opens the file chooser. */
  browse: string;
  /** Hint under the main line; built from accept and maxSize when not given. */
  limits: (accept: string | undefined, maxSize: string | undefined) => string;
  rejected: (name: string, reason: FileRejectReason) => string;
  remove: (name: string) => string;
  uploading: (percent: number) => string;
}

const DEFAULT_LABELS: FileDropLabels = {
  drop: "Drop files here or",
  browse: "browse",
  limits: (accept, max) => [accept ? `Accepted: ${accept}` : "", max ? `Up to ${max} each` : ""].filter(Boolean).join(". "),
  rejected: (name, reason) => (reason === "type" ? `${name}: this file type is not accepted` : reason === "size" ? `${name}: the file is too large` : `${name}: too many files`),
  remove: (name) => `Remove ${name}`,
  uploading: (p) => `Uploading, ${p}%`,
};

export interface FileDropProps {
  /** Names the zone for screen readers ("Cover image"). */
  label: string;
  accept?: string;
  /** Bytes. */
  maxSize?: number;
  multiple?: boolean;
  maxFiles?: number;
  disabled?: boolean;
  /** Accepted files of one pick or drop. */
  onFiles: (files: File[]) => void;
  /** Rejected files of one pick or drop; also listed under the zone until the next pick. */
  onReject?: (rejected: FileRejection[]) => void;
  /** Files to list under the zone. */
  items?: FileDropItem[];
  onRemove?: (id: string) => void;
  labels?: Partial<FileDropLabels>;
  className?: string;
}

export function FileDrop({ label, accept, maxSize, multiple, maxFiles, disabled, onFiles, onReject, items, onRemove, labels, className }: FileDropProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  const inputId = `x-filedrop-${useId()}`;
  const [over, setOver] = useState(false);
  const [rejected, setRejected] = useState<FileRejection[]>([]);
  const take = (list: FileList | null): void => {
    if (!list || disabled) return;
    const { accepted, rejected: bad } = checkFiles(Array.from(list), { accept, maxSize, multiple, maxFiles });
    setRejected(bad);
    if (bad.length) onReject?.(bad);
    if (accepted.length) onFiles(accepted);
  };
  const onDrop = (e: DragEvent<HTMLLabelElement>): void => {
    e.preventDefault();
    setOver(false);
    take(e.dataTransfer.files);
  };
  const onDragOver = (e: DragEvent<HTMLLabelElement>): void => {
    e.preventDefault();
    if (!disabled) setOver(true);
  };
  const limits = l.limits(accept, maxSize != null ? formatBytes(maxSize) : undefined);
  return (
    <div className={cx("x-filedrop", className)}>
      <label
        className="x-filedrop-zone"
        htmlFor={inputId}
        data-over={over ? "true" : undefined}
        data-disabled={disabled ? "true" : undefined}
        onDragOver={onDragOver}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
      >
        <Icon name="upload" size={20} />
        <span>
          {l.drop} <span className="x-filedrop-browse">{l.browse}</span>
        </span>
        {limits ? <small>{limits}</small> : null}
        <input
          id={inputId}
          className="x-sr-only"
          type="file"
          aria-label={label}
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            take(e.currentTarget.files);
            e.currentTarget.value = "";
          }}
        />
      </label>
      {rejected.length ? (
        <ul className="x-filedrop-errors" role="alert">
          {rejected.map((r) => (
            <li key={r.file.name}>{l.rejected(r.file.name, r.reason)}</li>
          ))}
        </ul>
      ) : null}
      {items?.length ? (
        <ul className="x-filedrop-list">
          {items.map((it) => (
            <li key={it.id} className="x-filedrop-item" data-error={it.error ? "true" : undefined}>
              <Icon name="file" />
              <span className="x-filedrop-name">{it.name}</span>
              {it.size != null ? <span className="x-filedrop-size">{formatBytes(it.size)}</span> : null}
              {it.progress != null && it.progress < 100 ? (
                <progress className="x-filedrop-progress" max={100} value={it.progress} aria-label={l.uploading(Math.round(it.progress))} />
              ) : null}
              {it.error ? <span className="x-filedrop-error">{it.error}</span> : null}
              {onRemove ? <IconButton icon="close" label={l.remove(it.name)} onClick={() => onRemove(it.id)} /> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
