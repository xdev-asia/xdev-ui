import { cloneElement, useEffect, useId, useState, type JSX, type ReactElement, type ReactNode } from "react";
import { cx } from "../../internal/cx";

export interface TooltipProps {
  /** Short text that describes the child. Plain text only; no links or buttons. */
  content: ReactNode;
  /** One focusable element (a button or link). It gets aria-describedby pointing at the tip. */
  children: ReactElement<{ "aria-describedby"?: string }>;
  /** Side of the child the tip appears on. Default "top". */
  placement?: "top" | "bottom";
  className?: string;
}

export function Tooltip({ content, children, placement = "top", className }: TooltipProps): JSX.Element {
  const tipId = `x-tip-${useId()}`;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const describedBy = cx(children.props["aria-describedby"], tipId);
  return (
    <span
      className="x-tooltip-anchor"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {cloneElement(children, { "aria-describedby": describedBy })}
      <span className={cx("x-tooltip", className)} role="tooltip" id={tipId} data-placement={placement} data-open={open ? "" : undefined}>
        {content}
      </span>
    </span>
  );
}
