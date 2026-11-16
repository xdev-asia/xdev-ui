import type { JSX } from "react";
import { mdBlocks } from "../workspace";

export interface MdViewProps {
  text: string;
  /** With it, each paragraph and list item is a button that starts a comment on that passage. */
  onPick?: (passage: string) => void;
  pickLabel?: string;
}

/** A document as headings, lists and paragraphs. Only the subset the stages write: "## " and "- ". */
export function MdView({ text, onPick, pickLabel }: MdViewProps): JSX.Element {
  const passage = (value: string): JSX.Element | string =>
    onPick ? (
      <button type="button" className="app-passage" title={pickLabel} onClick={() => onPick(value)}>
        {value}
      </button>
    ) : (
      value
    );
  return (
    <div className="app-md">
      {mdBlocks(text).map((b, i) =>
        b.kind === "h" ? (
          <h3 key={i}>{b.text}</h3>
        ) : b.kind === "ul" ? (
          <ul key={i}>
            {b.items.map((item, j) => (
              <li key={j}>{passage(item)}</li>
            ))}
          </ul>
        ) : (
          <p key={i}>{passage(b.text)}</p>
        ),
      )}
    </div>
  );
}
