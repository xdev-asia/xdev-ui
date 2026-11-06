import type { Editor } from "@tiptap/core";
import { NodeSelection, type Selection } from "@tiptap/pm/state";
import { useEditorState } from "@tiptap/react";
import { useId, type JSX } from "react";
import { Button } from "../../components/Button/Button";
import type { RichTextEditorLabels } from "./labels";

export interface SelectedImage {
  pos: number;
  alt: string;
  busy: boolean;
}

/** The image a node selection holds, or null. */
export function selectedImage(selection: Selection): SelectedImage | null {
  if (selection instanceof NodeSelection && selection.node.type.name === "image") {
    const { attrs } = selection.node;
    return { pos: selection.from, alt: (attrs.alt as string | null) ?? "", busy: Boolean(attrs.uploading) };
  }
  return null;
}

/** Bar shown while an image is selected: alt text and remove. */
export function ImageBar({ editor, labels, disabled }: { editor: Editor; labels: RichTextEditorLabels; disabled?: boolean }): JSX.Element | null {
  const inputId = `x-editor-alt-${useId()}`;
  const image = useEditorState({ editor, selector: ({ editor: e }) => (e ? selectedImage(e.state.selection) : null) });
  if (!image) return null;
  return (
    <div className="x-editor-imagebar">
      <label className="ws-field" htmlFor={inputId}>
        {labels.imageAlt}
        <input
          key={image.pos}
          id={inputId}
          defaultValue={image.alt}
          placeholder={labels.imageAltPlaceholder}
          disabled={disabled}
          onChange={(e) => editor.commands.updateAttributes("image", { alt: e.target.value })}
        />
      </label>
      <Button variant="secondary" icon="trash" disabled={disabled || image.busy} onClick={() => editor.chain().focus().deleteSelection().run()}>
        {labels.imageRemove}
      </Button>
    </div>
  );
}
