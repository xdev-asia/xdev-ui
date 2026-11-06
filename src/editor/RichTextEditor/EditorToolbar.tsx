import type { Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";
import { useRef, useState, type JSX, type KeyboardEvent } from "react";
import { Popover } from "../../components/Popover/Popover";
import { cx } from "../../internal/cx";
import { rovingIndex } from "../../internal/keys";
import { ToolGlyph, type ToolIcon } from "./icons";
import { IMAGE_TYPES } from "./insertImage";
import type { RichTextEditorLabels } from "./labels";
import { LinkForm } from "./LinkForm";

export type ToolKey = "heading2" | "heading3" | "bold" | "italic" | "bulletList" | "orderedList" | "quote" | "link" | "image" | "undo" | "redo";

export type ToolbarState = Record<"heading2" | "heading3" | "bold" | "italic" | "bulletList" | "orderedList" | "quote" | "link", boolean> & {
  canUndo: boolean;
  canRedo: boolean;
};

/** Reads the toggle and history state the toolbar shows. Pure over the two editor methods it calls. */
export function toolbarState(e: Pick<Editor, "isActive" | "can">): ToolbarState {
  return {
    heading2: e.isActive("heading", { level: 2 }),
    heading3: e.isActive("heading", { level: 3 }),
    bold: e.isActive("bold"),
    italic: e.isActive("italic"),
    bulletList: e.isActive("bulletList"),
    orderedList: e.isActive("orderedList"),
    quote: e.isActive("blockquote"),
    link: e.isActive("link"),
    canUndo: e.can().undo(),
    canRedo: e.can().redo(),
  };
}

export interface ToolItem {
  key: ToolKey;
  /** Toggles carry aria-pressed; actions (image, undo, redo) do not. */
  pressed?: boolean;
  disabled: boolean;
  /** A divider goes before this item. */
  group: boolean;
}

/** The buttons, in order. The image button exists only when uploads are possible. */
export function toolItems(s: ToolbarState, opts: { image: boolean; disabled?: boolean }): ToolItem[] {
  const off = Boolean(opts.disabled);
  const t = (key: ToolKey, pressed: boolean | undefined, group = false, disabled = off): ToolItem => ({ key, pressed, disabled, group });
  return [
    t("heading2", s.heading2),
    t("heading3", s.heading3),
    t("bold", s.bold, true),
    t("italic", s.italic),
    t("bulletList", s.bulletList, true),
    t("orderedList", s.orderedList),
    t("quote", s.quote),
    t("link", s.link, true),
    ...(opts.image ? [t("image", undefined)] : []),
    t("undo", undefined, true, off || !s.canUndo),
    t("redo", undefined, false, off || !s.canRedo),
  ];
}

function run(editor: Editor, key: ToolKey): void {
  const c = editor.chain().focus();
  switch (key) {
    case "heading2": c.toggleHeading({ level: 2 }).run(); break;
    case "heading3": c.toggleHeading({ level: 3 }).run(); break;
    case "bold": c.toggleBold().run(); break;
    case "italic": c.toggleItalic().run(); break;
    case "bulletList": c.toggleBulletList().run(); break;
    case "orderedList": c.toggleOrderedList().run(); break;
    case "quote": c.toggleBlockquote().run(); break;
    case "undo": c.undo().run(); break;
    case "redo": c.redo().run(); break;
    default: break;
  }
}

/** Moves focus between tool buttons. Keys from anything else inside the toolbar (the link form) pass through. */
export function onToolbarKeyDown(e: KeyboardEvent<HTMLElement>, setActive: (i: number) => void): void {
  const target = e.target as HTMLElement;
  if (!target.hasAttribute?.("data-x-tool")) return;
  const buttons = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>("[data-x-tool]"));
  const index = buttons.indexOf(target as HTMLButtonElement);
  if (index < 0) return;
  const next = rovingIndex(e.key, index, buttons.length, "horizontal", (i) => buttons[i].disabled);
  if (next == null) return;
  e.preventDefault();
  buttons[next].focus();
  setActive(next);
}

export interface EditorToolbarProps {
  editor: Editor;
  labels: RichTextEditorLabels;
  linkOpen: boolean;
  onLinkOpenChange: (open: boolean) => void;
  /** Absent: no image button. */
  onPickImages?: (files: File[]) => void;
  disabled?: boolean;
}

export function EditorToolbar({ editor, labels, linkOpen, onLinkOpenChange, onPickImages, disabled }: EditorToolbarProps): JSX.Element {
  const file = useRef<HTMLInputElement>(null);
  const [active, setActive] = useState(0);
  const state = useEditorState({ editor, selector: ({ editor: e }) => toolbarState(e) });
  const items = toolItems(state, { image: Boolean(onPickImages), disabled });
  // The single Tab stop: the last focused button, or the first enabled one when that is disabled.
  const stop = items[active] && !items[active].disabled ? active : Math.max(0, items.findIndex((i) => !i.disabled));

  const button = (item: ToolItem, i: number, extra: Record<string, unknown> = {}): JSX.Element => (
    <button
      key={item.key}
      type="button"
      className="ws-icon-btn x-editor-tool"
      data-x-tool={item.key}
      aria-label={labels[item.key]}
      title={item.key === "link" ? `${labels.link} (Ctrl+K)` : labels[item.key]}
      aria-pressed={item.pressed}
      disabled={item.disabled}
      tabIndex={i === stop ? 0 : -1}
      onFocus={() => setActive(i)}
      onClick={() => {
        if (item.key === "link") onLinkOpenChange(!linkOpen);
        else if (item.key === "image") file.current?.click();
        else run(editor, item.key);
      }}
      {...extra}
    >
      <ToolGlyph name={item.key as ToolIcon} />
    </button>
  );

  return (
    <div className="x-editor-toolbar" role="toolbar" aria-label={labels.toolbar} aria-disabled={disabled || undefined} onKeyDown={(e) => onToolbarKeyDown(e, setActive)}>
      {items.map((item, i) => (
        <span key={item.key} className={cx("x-editor-slot", item.group && "x-editor-group")}>
          {item.key === "link" ? (
            <Popover
              open={linkOpen && !disabled}
              onClose={() => onLinkOpenChange(false)}
              label={labels.linkDialog}
              trigger={(p) => button(item, i, p as unknown as Record<string, unknown>)}
            >
              <LinkForm
                editor={editor}
                labels={labels}
                onDone={() => {
                  onLinkOpenChange(false);
                  // Popover hands focus back to its trigger on close; the text is where the user was.
                  setTimeout(() => editor.commands.focus(), 0);
                }}
              />
            </Popover>
          ) : (
            button(item, i)
          )}
        </span>
      ))}
      {onPickImages ? (
        <input
          ref={file}
          type="file"
          accept={IMAGE_TYPES.join(",")}
          multiple
          hidden
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            onPickImages(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
      ) : null}
    </div>
  );
}
