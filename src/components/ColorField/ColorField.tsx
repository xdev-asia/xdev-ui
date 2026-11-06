import { useEffect, useId, useState, type HTMLAttributes, type JSX } from "react";
import { cx } from "../../internal/cx";
import { IconButton } from "../IconButton/IconButton";

/** Neutral value for the native picker while `value` is not a colour (it rejects anything but `#rrggbb`). */
const BLACK = `#${"0".repeat(6)}`;
const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** Reads `#rgb` or `#rrggbb` (with or without `#`, any case) and returns lower-case `#rrggbb`, or null. */
export function normalizeHex(text: string): string | null {
  const m = HEX.exec(text.trim());
  if (!m) return null;
  const d = m[1].toLowerCase();
  const full = d.length === 3 ? [...d].map((c) => c + c).join("") : d;
  return `#${full}`;
}

/** Calls `onChange` with the normalised colour when `text` is a valid hex; returns whether it did. */
export function commitHexText(text: string, onChange: (hex: string) => void): boolean {
  const hex = normalizeHex(text);
  if (hex) onChange(hex);
  return hex !== null;
}

export interface ColorFieldLabels {
  /** Label of the reset button. */
  reset: string;
  /** aria-label of the colour swatch. */
  picker: string;
  /** Message shown while the hex text is not a colour. */
  invalid: string;
}

export interface ColorFieldProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "id"> {
  /** The token name, shown as the visible label. */
  label: string;
  /** The colour in force: `#rrggbb`. */
  value: string;
  /** Whether a value of the user replaces the built-in one; enables reset. */
  overridden: boolean;
  /** Called with a valid lower-case `#rrggbb` only. */
  onChange: (hex: string) => void;
  onReset: () => void;
  labels: ColorFieldLabels;
  /** Id of the hex field; generated when omitted. */
  id?: string;
  "data-key"?: string;
}

export function ColorField({ label, value, overridden, onChange, onReset, labels, id, className, ...rest }: ColorFieldProps): JSX.Element {
  const auto = useId();
  const fieldId = id ?? `x-colour-${auto}`;
  const [text, setText] = useState(value);
  // The committed value moves (reset, mode switch): the text follows it.
  useEffect(() => setText(value), [value]);
  const bad = normalizeHex(text) === null;
  return (
    <div className={cx("x-colour-field", className)} {...rest}>
      <label className="x-colour-field-name" htmlFor={fieldId}>
        {label}
      </label>
      <input
        type="color"
        className="x-colour-field-swatch"
        aria-label={labels.picker}
        value={normalizeHex(value) ?? BLACK}
        onChange={(e) => onChange(e.target.value)}
      />
      <input
        id={fieldId}
        className="x-colour-field-hex"
        type="text"
        spellCheck={false}
        autoComplete="off"
        maxLength={7}
        value={text}
        aria-invalid={bad ? true : undefined}
        aria-describedby={bad ? `${fieldId}-error` : undefined}
        onChange={(e) => {
          setText(e.target.value);
          commitHexText(e.target.value, onChange);
        }}
        onBlur={() => {
          if (bad) setText(value);
        }}
      />
      <IconButton className="x-colour-field-reset" icon="undo" label={labels.reset} disabled={!overridden} onClick={onReset} />
      {bad ? (
        <small className="x-colour-field-error" id={`${fieldId}-error`} role="alert">
          {labels.invalid}
        </small>
      ) : null}
    </div>
  );
}
