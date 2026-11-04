import type { JSX, ReactNode } from "react";
import { cx } from "../../internal/cx";

export interface FieldMessageProps {
  /** "error" is announced at once (role=alert); "warn" and "info" are read through aria-describedby. Default "error". */
  tone?: "error" | "warn" | "info";
  /** Give it an id and point the field's aria-describedby at it. */
  id?: string;
  children: ReactNode;
  className?: string;
}

export function FieldMessage({ tone = "error", id, children, className }: FieldMessageProps): JSX.Element {
  return (
    <p className={cx("x-field-msg", tone === "error" && "error-text", className)} data-tone={tone} id={id} role={tone === "error" ? "alert" : undefined}>
      {children}
    </p>
  );
}
