import type { ChangeEvent, JSX } from "react";
import { cx } from "../../internal/cx";
import { normalizeCode, type CodeAlphabet } from "./normalizeCode";

export interface CodeInputProps {
  /** Number of characters: 10 for a pairing code, 6 for a check code. */
  length: number;
  /** Characters per visual group. Default 5. */
  groupSize?: number;
  /** The normalised code, without separators. */
  value: string;
  onChange: (value: string) => void;
  /** Called once when typing or pasting brings the code to `length`. */
  onComplete?: (value: string) => void;
  /** "crockford" (default) is base32 without I, L, O, U; "digits" takes 0 to 9 only. */
  alphabet?: CodeAlphabet;
  /** Accessible name of the input. Pair it with a visible label (a `Field` or heading). */
  label: string;
  /** 1px danger border and aria-invalid. */
  invalid?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
}

export function CodeInput({
  length,
  groupSize = 5,
  value,
  onChange,
  onComplete,
  alphabet = "crockford",
  label,
  invalid = false,
  disabled = false,
  autoFocus = false,
  className,
}: CodeInputProps): JSX.Element {
  const code = value.slice(0, length);
  const handle = (e: ChangeEvent<HTMLInputElement>): void => {
    const clean = normalizeCode(e.target.value, alphabet).slice(0, length);
    if (clean === value) return;
    onChange(clean);
    if (clean.length === length) onComplete?.(clean);
  };
  const size = Math.max(1, Math.floor(groupSize));
  const groups = Array.from({ length: Math.ceil(length / size) }, (_, g) => Array.from({ length: Math.min(size, length - g * size) }, (_, j) => g * size + j));
  const next = Math.min(code.length, length - 1);
  return (
    <div className={cx("x-code-input", className)} data-invalid={invalid ? "" : undefined} data-disabled={disabled ? "" : undefined}>
      <div className="x-code-cells" aria-hidden="true">
        {groups.map((g) => (
          <span className="x-code-group" key={g[0]}>
            {g.map((i) => (
              <span className="x-code-cell" key={i} data-filled={code[i] ? "" : undefined} data-next={i === next ? "" : undefined}>
                {code[i]}
              </span>
            ))}
          </span>
        ))}
      </div>
      <input
        className="x-code-field"
        type="text"
        value={code}
        onChange={handle}
        aria-label={label}
        aria-invalid={invalid ? true : undefined}
        disabled={disabled}
        autoFocus={autoFocus}
        inputMode={alphabet === "digits" ? "numeric" : "text"}
        autoComplete="off"
        autoCapitalize="characters"
        autoCorrect="off"
        spellCheck={false}
      />
    </div>
  );
}
