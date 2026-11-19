import type { JSX, KeyboardEvent, ReactNode } from "react";
import { cx } from "../../internal/cx";
import { IconButton } from "../IconButton/IconButton";

export interface TagProps {
  tone?: "default" | "warn";
  /** Makes the tag removable: a trailing button, and Backspace on the focused tag. */
  onRemove?: () => void;
  /** Accessible name of the remove button. Required with `onRemove`. */
  removeLabel?: string;
  /** A CSS colour drawn as a small round dot before the text, for a category whose colour is data. Decoration only. */
  swatch?: string;
  children: ReactNode;
}

export function Tag({ tone = "default", onRemove, removeLabel, swatch, children }: TagProps): JSX.Element {
  const cls = cx("ws-tag", tone === "warn" && "ws-tag-warn", swatch && "ws-tag-swatched");
  const dot = swatch ? <span className="ws-tag-swatch" style={{ background: swatch }} aria-hidden="true" /> : null;
  if (!onRemove)
    return (
      <span className={cls}>
        {dot}
        {children}
      </span>
    );
  const onKeyDown = (e: KeyboardEvent<HTMLSpanElement>): void => {
    if (e.key !== "Backspace" || e.repeat || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    e.preventDefault();
    onRemove();
  };
  return (
    <span className={cx(cls, "ws-tag-removable")} tabIndex={0} onKeyDown={onKeyDown}>
      {dot}
      {children}
      <IconButton icon="close" label={removeLabel ?? "Remove"} className="ws-tag-remove" tabIndex={-1} onClick={onRemove} />
    </span>
  );
}
