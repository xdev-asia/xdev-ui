import { Extension, type AnyExtension } from "@tiptap/core";
import Image, { type ImageOptions } from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { Placeholder } from "@tiptap/extensions";
import { Markdown } from "@tiptap/markdown";
import StarterKit from "@tiptap/starter-kit";

/** Links the editor accepts: http(s) only. */
const SAFE_URL = /^https?:\/\/\S+$/i;

/** True for an absolute http(s) URL without spaces. Anything else (javascript:, data:, relative) is refused. */
export const isSafeUrl = (url: string): boolean => SAFE_URL.test(url.trim());

/** Heading levels 1 and 4-6 become 2 and 3: the page title is not part of the body. */
export const clampHeadingLevel = (depth: number | undefined): 2 | 3 => ((depth ?? 2) <= 2 ? 2 : 3);

/**
 * Runs before StarterKit's heading parser (higher priority, tried first) so stored Markdown with
 * `#` or `####` lands on level 2 or 3. `@tiptap/extension-heading` is not a peer, so it is not extended.
 */
const HeadingLevels = Extension.create({
  name: "xHeadingLevels",
  priority: 1000,
  markdownTokenName: "heading",
  parseMarkdown(token, helpers) {
    return helpers.createNode("heading", { level: clampHeadingLevel(token.depth) }, helpers.parseInline(token.tokens ?? []));
  },
  // The Markdown manager renders a node with the first handler registered for its token name, which
  // is this one, so it must render headings too (same output as the heading extension).
  renderMarkdown(node, helpers) {
    if (!node.content) return "";
    return `${"#".repeat(clampHeadingLevel(Number(node.attrs?.level) || 2))} ${helpers.renderChildren(node.content)}`;
  },
});

const SafeLink = Link.extend({
  parseMarkdown(token, helpers) {
    const content = helpers.parseInline(token.tokens ?? []);
    // A link to anything else (javascript:, data:, ...) keeps its text and loses the link.
    if (!isSafeUrl(token.href ?? "")) return content;
    return helpers.applyMark("link", content, { href: token.href, title: token.title || null });
  },
});

export interface EditorImageOptions {
  /** Maps a stored `src` to the URL the browser loads (e.g. through a proxy). Never written back. */
  resolveSrc: (src: string) => string;
  /** Screen reader text of the spinner shown while an image uploads. */
  uploadingLabel: () => string;
}

/**
 * Image whose stored `src` is what `onUploadImage` returned. `uploading` is editor-only state: it
 * dims the image and shows a spinner, and is never written to Markdown or HTML.
 */
const EditorImage = Image.extend<ImageOptions & EditorImageOptions>({
  addOptions() {
    return {
      ...(this.parent?.() as ImageOptions),
      resolveSrc: (src: string) => src,
      uploadingLabel: () => "Uploading image",
    };
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      uploading: { default: false, rendered: false },
    };
  },

  addNodeView() {
    const options = this.options;
    return ({ node: initial }) => {
      let node = initial;
      const dom = document.createElement("div");
      dom.className = "x-editor-image";
      const img = document.createElement("img");
      const spinner = document.createElement("span");
      spinner.className = "x-spinner";
      spinner.setAttribute("role", "status");
      spinner.dataset.size = "md";
      const ring = document.createElement("span");
      ring.className = "x-spinner-ring";
      ring.setAttribute("aria-hidden", "true");
      const text = document.createElement("span");
      text.className = "x-sr-only";
      spinner.append(ring, text);
      dom.append(img);

      const paint = (): void => {
        const src = (node.attrs.src as string | null) ?? "";
        img.src = src.startsWith("blob:") ? src : options.resolveSrc(src);
        img.alt = (node.attrs.alt as string | null) ?? "";
        const busy = Boolean(node.attrs.uploading);
        if (busy) {
          dom.dataset.uploading = "";
          text.textContent = options.uploadingLabel();
          if (!spinner.isConnected) dom.append(spinner);
        } else {
          delete dom.dataset.uploading;
          spinner.remove();
        }
      };
      paint();

      return {
        dom,
        update(updated) {
          if (updated.type !== node.type) return false;
          node = updated;
          paint();
          return true;
        },
      };
    };
  },
});

export interface EditorExtensionOptions {
  /** Placeholder text, read each time the editor is empty. */
  placeholder?: () => string;
  resolveSrc?: (src: string) => string;
  uploadingLabel?: () => string;
}

/**
 * The formats an article may use, and nothing more: headings 2-3, bold, italic, links, bullet and
 * numbered lists, quotes and images. The same list backs the toolbar, so what cannot be made in the
 * editor cannot arrive through pasted or stored content either.
 */
export function editorExtensions({ placeholder, resolveSrc, uploadingLabel }: EditorExtensionOptions = {}): AnyExtension[] {
  return [
    StarterKit.configure({
      heading: { levels: [2, 3] },
      link: false,
      underline: false,
      strike: false,
      code: false,
      codeBlock: false,
      horizontalRule: false,
    }),
    HeadingLevels,
    SafeLink.configure({
      openOnClick: false,
      autolink: false,
      protocols: [],
      isAllowedUri: (url) => isSafeUrl(url),
    }),
    EditorImage.configure({
      inline: false,
      allowBase64: false,
      resolveSrc: resolveSrc ?? ((src: string) => src),
      uploadingLabel: uploadingLabel ?? (() => "Uploading image"),
    }),
    Placeholder.configure({ placeholder: () => placeholder?.() ?? "" }),
    Markdown,
  ];
}
