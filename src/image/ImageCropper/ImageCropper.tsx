import { useId, useRef, useState, type JSX, type KeyboardEvent, type ReactNode } from "react";
import Cropper from "react-easy-crop";
import { Button } from "../../components/Button/Button";
import { useModal } from "../../internal/modal";
import type { CropArea } from "../crop";

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 3;

export interface ImageCropperLabels {
  /** Dialog title; the `title` prop wins. */
  title: string;
  /** One line under the title on how to move and zoom. */
  description: string;
  /** Names the crop frame for screen readers (it takes focus and moves with the arrow keys). */
  area: string;
  zoom: string;
  rotate: string;
  reset: string;
  cancel: string;
  confirm: string;
}

const DEFAULT_LABELS: ImageCropperLabels = {
  title: "Crop image",
  description: "Drag the image or use the arrow keys to move it. Scroll or use Zoom to zoom in.",
  area: "Crop frame",
  zoom: "Zoom",
  rotate: "Rotate 90°",
  reset: "Reset",
  cancel: "Cancel",
  confirm: "Use this image",
};

export interface ImageCropperProps {
  /** The image to crop: an object URL or a same-origin (or CORS-enabled) URL. */
  src: string;
  /** Width / height of the crop frame, e.g. 16 / 9. */
  aspect: number;
  /** Cancel and Esc (a click on the backdrop does not close it, so a drag that ends outside keeps the crop). Not called while `busy`. */
  onCancel: () => void;
  /** The chosen area in pixels of the rotated image, and the rotation in degrees (0, 90, 180, 270). */
  onConfirm: (area: CropArea, rotation: number) => void;
  /** Overrides `labels.title`. */
  title?: ReactNode;
  /** The caller is processing the crop: both buttons are disabled and every close request is ignored. */
  busy?: boolean;
  /** false renders the markup only (previews). Default true. */
  modal?: boolean;
  labels?: Partial<ImageCropperLabels>;
}

/**
 * Modal crop dialog with a fixed frame ratio. Mount it only while open, with a `key` per image, so zoom, rotation
 * and position start fresh.
 */
export function ImageCropper({ src, aspect, onCancel, onConfirm, title, busy, modal = true, labels }: ImageCropperProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  const id = useId();
  const titleId = `x-cropper-${id}`;
  const descId = `x-cropper-d-${id}`;
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [rotation, setRotation] = useState(0);
  const [area, setArea] = useState<CropArea | null>(null);
  const root = useRef<HTMLDivElement | null>(null);
  const panel = useRef<HTMLDivElement | null>(null);
  const stage = useRef<HTMLDivElement | null>(null);
  const cancel = (): void => {
    if (!busy) onCancel();
  };
  const trap = useModal(modal, root, panel, cancel);
  // Nested in another modal (an ImageField in a FormDialog): keep the outer trap from handling the same key.
  const onKeyDown = trap
    ? (e: KeyboardEvent<HTMLDivElement>): void => {
        trap(e);
        if (e.key === "Tab" || e.key === "Escape") e.stopPropagation();
      }
    : undefined;
  // The crop frame exists only once the image has loaded; then it takes focus so the arrow keys pan.
  const focusFrame = (): void => {
    if (!modal) return;
    requestAnimationFrame(() => stage.current?.querySelector<HTMLElement>(".reactEasyCrop_CropArea")?.focus());
  };
  const reset = (): void => {
    setCrop({ x: 0, y: 0 });
    setZoom(MIN_ZOOM);
    setRotation(0);
  };
  const confirm = (): void => {
    if (area && !busy) onConfirm(area, rotation);
  };
  return (
    <div className="dialog-backdrop" ref={root} data-modal={modal ? "true" : undefined} onKeyDown={onKeyDown}>
      <div
        ref={panel}
        className="dialog x-image-cropper"
        role="dialog"
        aria-modal={modal ? "true" : undefined}
        aria-labelledby={titleId}
        aria-describedby={descId}
        aria-busy={busy ? "true" : undefined}
        tabIndex={modal ? -1 : undefined}
      >
        <h2 className="dialog-title" id={titleId}>
          {title ?? l.title}
        </h2>
        <p className="x-image-cropper-desc" id={descId}>
          {l.description}
        </p>
        <div className="x-image-cropper-stage" ref={stage}>
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            minZoom={MIN_ZOOM}
            maxZoom={MAX_ZOOM}
            keyboardStep={10}
            cropperProps={{ "aria-label": l.area }}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={(_, pixels) => setArea(pixels)}
            onMediaLoaded={focusFrame}
          />
        </div>
        <div className="x-image-cropper-tools">
          <label className="x-image-cropper-zoom">
            <span>{l.zoom}</span>
            <input
              type="range"
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={0.05}
              value={zoom}
              disabled={busy}
              onChange={(e) => setZoom(Number(e.currentTarget.value))}
            />
            <output aria-hidden="true">{zoom.toFixed(1)}×</output>
          </label>
          <Button variant="secondary" icon="refresh" disabled={busy} onClick={() => setRotation((r) => (r + 90) % 360)}>
            {l.rotate}
          </Button>
          <Button variant="secondary" icon="undo" disabled={busy} onClick={reset}>
            {l.reset}
          </Button>
        </div>
        <div className="dialog-actions">
          <Button variant="secondary" onClick={cancel} disabled={busy}>
            {l.cancel}
          </Button>
          <Button onClick={confirm} disabled={!area || busy}>
            {busy ? (
              <span className="x-spinner" data-size="sm" aria-hidden="true">
                <span className="x-spinner-ring" />
              </span>
            ) : null}
            {l.confirm}
          </Button>
        </div>
      </div>
    </div>
  );
}
