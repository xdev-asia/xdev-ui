import type { Editor } from "@tiptap/core";
import { useEffect, useId, useRef, useState, type JSX } from "react";
import { Button } from "../../components/Button/Button";
import { isSafeUrl } from "./extensions";
import type { RichTextEditorLabels } from "./labels";

/** What applying `url` does: refuse it, insert it as linked text (empty selection, no link), or link the selection. */
export function linkAction(url: string, ctx: { empty: boolean; inLink: boolean }): "invalid" | "insert" | "set" {
  if (!isSafeUrl(url)) return "invalid";
  return ctx.empty && !ctx.inLink ? "insert" : "set";
}

export interface LinkFormProps {
  editor: Editor;
  labels: RichTextEditorLabels;
  /** Called after apply or remove; the editor takes focus back. */
  onDone: () => void;
}

/** Link address form for the toolbar popover. Mounted only while the popover is open. */
export function LinkForm({ editor, labels, onDone }: LinkFormProps): JSX.Element {
  const inputId = `x-editor-link-${useId()}`;
  const errorId = `${inputId}-error`;
  const input = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(() => (editor.getAttributes("link").href as string | undefined) ?? "");
  const [invalid, setInvalid] = useState(false);
  const inLink = editor.isActive("link");

  // Popover focuses its panel in its own effect, which runs after ours: focus the input one tick later.
  useEffect(() => {
    const t = setTimeout(() => input.current?.focus(), 0);
    return () => clearTimeout(t);
  }, []);

  const apply = (): void => {
    const href = url.trim();
    const action = linkAction(href, { empty: editor.state.selection.empty, inLink });
    if (action === "invalid") {
      setInvalid(true);
      return;
    }
    const chain = editor.chain().focus();
    if (action === "insert") chain.insertContent({ type: "text", text: href, marks: [{ type: "link", attrs: { href } }] }).run();
    else chain.extendMarkRange("link").setLink({ href }).run();
    onDone();
  };

  const remove = (): void => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    onDone();
  };

  return (
    <form
      className="x-editor-link"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        apply();
      }}
    >
      <label className="ws-field" htmlFor={inputId} data-invalid={invalid ? "" : undefined}>
        {labels.linkUrl}
        <input
          ref={input}
          id={inputId}
          type="url"
          inputMode="url"
          value={url}
          placeholder="https://"
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? errorId : undefined}
          onChange={(e) => {
            setUrl(e.target.value);
            setInvalid(false);
          }}
        />
        {invalid ? (
          <small id={errorId} role="alert">
            {labels.linkInvalid}
          </small>
        ) : null}
      </label>
      <div className="dialog-actions">
        {inLink ? (
          <Button variant="secondary" onClick={remove}>
            {labels.linkRemove}
          </Button>
        ) : null}
        <Button type="submit">{labels.linkApply}</Button>
      </div>
    </form>
  );
}
