import { useId, type InputHTMLAttributes, type JSX } from "react";
import { cx } from "../../internal/cx";
import { fontStack, UI_FONT_SUGGESTIONS } from "../../theme/font";
import { Icon } from "../Icon/Icon";

export interface FontFieldLabels {
  /** aria-label of the button that clears the name and returns to the default font. */
  reset: string;
}

const DEFAULT_LABELS: FontFieldLabels = { reset: "Use the default font" };

export interface FontFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange" | "list"> {
  /** The family name; empty means the default font. */
  value: string;
  onChange: (value: string) => void;
  /** Names offered in the list. Any other installed family can still be typed. */
  suggestions?: readonly string[];
  /** Override the English defaults (e.g. for vi). */
  labels?: Partial<FontFieldLabels>;
}

export function FontField({ value, onChange, suggestions = UI_FONT_SUGGESTIONS, labels, className, style, ...rest }: FontFieldProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  const listId = `x-font-${useId()}`;
  const stack = fontStack(value);
  return (
    <div className={cx("font-field", className)}>
      <input
        type="text"
        className="font-field-input"
        list={listId}
        value={value}
        spellCheck={false}
        autoComplete="off"
        style={stack || style ? { ...(stack ? { fontFamily: stack } : null), ...style } : undefined}
        onChange={(e) => onChange(e.target.value)}
        {...rest}
      />
      <datalist id={listId}>
        {suggestions.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
      {value !== "" ? (
        <button type="button" className="font-field-reset" aria-label={l.reset} disabled={rest.disabled} onClick={() => onChange("")}>
          <Icon name="close" size={14} />
        </button>
      ) : null}
    </div>
  );
}
