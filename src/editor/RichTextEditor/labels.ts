export interface RichTextEditorLabels {
  /** aria-label of the formatting toolbar. */
  toolbar: string;
  heading2: string;
  heading3: string;
  bold: string;
  italic: string;
  bulletList: string;
  orderedList: string;
  quote: string;
  link: string;
  image: string;
  undo: string;
  redo: string;
  /** Link form. */
  linkDialog: string;
  linkUrl: string;
  linkInvalid: string;
  linkApply: string;
  linkRemove: string;
  /** Image bar, shown while an image is selected. */
  imageAlt: string;
  imageAltPlaceholder: string;
  imageRemove: string;
  /** Spinner on an image that is uploading. */
  uploading: string;
  /** Shown when a picked, pasted or dropped file is not JPG/PNG/WebP or too big; gets the limit ("10 MB"). */
  imageInvalid: (maxSize: string) => string;
  /** Shown when `onUploadImage` rejects and there is no `onUploadError`. */
  uploadFailed: string;
}

export const DEFAULT_LABELS: RichTextEditorLabels = {
  toolbar: "Formatting",
  heading2: "Heading 2",
  heading3: "Heading 3",
  bold: "Bold",
  italic: "Italic",
  bulletList: "Bulleted list",
  orderedList: "Numbered list",
  quote: "Quote",
  link: "Link",
  image: "Insert image",
  undo: "Undo",
  redo: "Redo",
  linkDialog: "Edit link",
  linkUrl: "Link address",
  linkInvalid: "Use an address that starts with http:// or https://.",
  linkApply: "Apply",
  linkRemove: "Remove link",
  imageAlt: "Image description",
  imageAltPlaceholder: "What does this image show?",
  imageRemove: "Remove image",
  uploading: "Uploading image",
  imageInvalid: (maxSize) => `Use a JPG, PNG or WebP image up to ${maxSize}.`,
  uploadFailed: "The image could not be uploaded. Try again.",
};
