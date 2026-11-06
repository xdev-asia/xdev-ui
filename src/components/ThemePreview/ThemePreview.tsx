import type { JSX } from "react";
import { cx } from "../../internal/cx";
import { StatusDot } from "../StatusDot/StatusDot";

export interface ThemePreviewProps {
  /** The mode shown. The card sets its own `data-theme`, so that mode's tokens paint it. */
  mode: "dark" | "light";
  /** Heading and accessible name of the card. */
  title: string;
  /** Sample body text. */
  sample: string;
  /** Sample hint text (muted). */
  hint: string;
  /** Text of the sample button. */
  button: string;
  className?: string;
}

export function ThemePreview({ mode, title, sample, hint, button, className }: ThemePreviewProps): JSX.Element {
  return (
    <section className={cx("x-theme-preview", className)} data-theme={mode} aria-label={title}>
      <h5 className="x-theme-preview-title">{title}</h5>
      <p className="x-theme-preview-text">{sample}</p>
      <p className="x-theme-preview-hint">{hint}</p>
      <div className="x-theme-preview-row">
        <span className="x-theme-preview-button">{button}</span>
        <StatusDot tone="ok" />
        <StatusDot tone="warn" />
        <StatusDot tone="danger" />
      </div>
    </section>
  );
}
