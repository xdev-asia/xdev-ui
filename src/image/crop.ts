// Pure geometry plus canvas helpers for cropping and re-encoding images in the browser.

export type Size = { width: number; height: number };
export type CropArea = { x: number; y: number; width: number; height: number };
/** Fixed output of an image field: the ratio of the crop frame and the exported size in pixels. */
export type ImageAspect = { ratio: number; width: number; height: number };

/** Size of the image after a rotation by `degrees` (multiples of 90). */
export function rotatedSize(width: number, height: number, degrees: number): Size {
  const quarter = Math.abs(Math.round(degrees / 90)) % 2 === 1;
  return quarter ? { width: height, height: width } : { width, height };
}

/** Scales down to `max` wide, keeping the ratio; never scales up. */
export function fitWidth(width: number, height: number, max = 1600): Size {
  if (width <= max) return { width, height };
  return { width: max, height: Math.round((height * max) / width) };
}

/** True when `width / height` is within `tolerance` (relative) of `ratio`. */
export function sameAspect(width: number, height: number, ratio: number, tolerance = 0.01): boolean {
  if (!width || !height || !ratio) return false;
  return Math.abs(width / height - ratio) / ratio <= tolerance;
}

/** Replaces the file extension, or appends one when there is none. */
export function renameExtension(name: string, ext: string): string {
  const base = name.replace(/\.[^./\\]+$/, "") || "image";
  return `${base}.${ext}`;
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image could not be read"));
    image.src = src;
  });
}

export type EncodeOptions = { type?: string; quality?: number };

/**
 * Draws the cropped, rotated area straight onto a canvas of the output size (never a canvas of the
 * full photo, which iOS Safari refuses for large images) and encodes it (WebP by default).
 */
export async function cropToBlob(
  image: CanvasImageSource & { naturalWidth: number; naturalHeight: number },
  area: CropArea,
  rotation: number,
  out: Size,
  { type = "image/webp", quality = 0.85 }: EncodeOptions = {},
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = out.width;
  canvas.height = out.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D is not available");
  ctx.imageSmoothingQuality = "high";
  // `area` is in the coordinates of the rotated image: map the canvas onto it, then draw the image
  // rotated about its own centre.
  const rotated = rotatedSize(image.naturalWidth, image.naturalHeight, rotation);
  ctx.scale(out.width / area.width, out.height / area.height);
  ctx.translate(-area.x, -area.y);
  ctx.translate(rotated.width / 2, rotated.height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Image could not be encoded"))), type, quality);
  });
}

/** Re-encodes the whole image at most `max` wide (for images pasted into rich text). */
export async function resizeToBlob(image: HTMLImageElement, max = 1600, options?: EncodeOptions): Promise<Blob> {
  const out = fitWidth(image.naturalWidth, image.naturalHeight, max);
  return cropToBlob(image, { x: 0, y: 0, width: image.naturalWidth, height: image.naturalHeight }, 0, out, options);
}
