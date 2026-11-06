import type { JSX, KeyboardEvent } from "react";
import { cx } from "../../internal/cx";
import { rovingIndex } from "../../internal/keys";

export type SwatchTone = "danger" | "warning" | "accent" | "neutral";

export interface SwatchOption {
  value: string;
  /** Accessible name of the swatch ("Red"). Colour alone says nothing to a screen reader. */
  label: string;
  tone: SwatchTone;
}

export interface SwatchGroupProps {
  value: string;
  onChange: (value: string) => void;
  /** At most 8. */
  options: SwatchOption[];
  /** "sm" is 24px, "md" 32px. Default "md". */
  size?: "sm" | "md";
  /** Names the group ("Colour"). */
  "aria-label": string;
  className?: string;
}

export function SwatchGroup({ value, onChange, options, size = "md", "aria-label": ariaLabel, className }: SwatchGroupProps): JSX.Element {
  const selected = options.findIndex((o) => o.value === value);
  const stop = selected < 0 ? 0 : selected;
  const onKeyDown = (e: KeyboardEvent<HTMLElement>): void => {
    if (e.key === "Home" || e.key === "End") return;
    // Up/Down move like Left/Right, as native radios do.
    const key = e.key === "ArrowDown" ? "ArrowRight" : e.key === "ArrowUp" ? "ArrowLeft" : e.key;
    const next = rovingIndex(key, stop, options.length);
    if (next == null) return;
    e.preventDefault();
    onChange(options[next].value);
    (e.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]')[next])?.focus();
  };
  return (
    <div className={cx("x-swatches", className)} role="radiogroup" aria-label={ariaLabel} data-size={size} onKeyDown={onKeyDown}>
      {options.map((o, i) => (
        <button
          key={o.value}
          type="button"
          className="x-swatch"
          role="radio"
          aria-checked={i === selected}
          aria-label={o.label}
          tabIndex={i === stop ? 0 : -1}
          data-tone={o.tone}
          onClick={() => onChange(o.value)}
        />
      ))}
    </div>
  );
}
