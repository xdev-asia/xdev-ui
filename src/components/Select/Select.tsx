import { useId, type JSX, type ReactNode, type Ref, type SelectHTMLAttributes } from "react";
import { cx } from "../../internal/cx";
import type { IconName } from "../../icons";
import { Icon } from "../Icon/Icon";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
  ref?: Ref<HTMLSelectElement>;
  /** Leading icon inside the control, such as "globe" for a language picker. Decorative: the select still needs a label. */
  icon?: IconName;
  /** Visible label above the select, like `Field`: the select then sits in a `.ws-field` with an optional hint or error line. */
  label?: ReactNode;
  /** Line under the select (needs `label`). */
  hint?: ReactNode;
  /** Error line under the select; marks it invalid (needs `label`). */
  error?: ReactNode;
  /** Keep the label for screen readers only. */
  hideLabel?: boolean;
}

export function Select(props: SelectProps): JSX.Element {
  // The labelled form needs an id (a hook); the bare select stays a plain function of its props.
  return props.label != null ? <SelectField {...props} /> : SelectControl(props);
}

function SelectControl({ options, className, icon, label: _label, hint: _hint, error: _error, hideLabel: _hide, ...rest }: SelectProps): JSX.Element {
  const select = (
    <select className={cx("lang-select", className)} data-icon={icon ? "" : undefined} {...rest}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
  if (!icon) return select;
  return (
    <span className="x-select-wrap">
      <Icon name={icon} className="x-select-icon" />
      {select}
    </span>
  );
}

function SelectField({ label, hint, error, hideLabel, id, className, ...rest }: SelectProps): JSX.Element {
  const auto = useId();
  const selectId = id ?? `x-select-${auto}`;
  const note = error ?? hint;
  const noteId = note ? `${selectId}-hint` : undefined;
  return (
    <div className={cx("ws-field x-select-field", className)} data-invalid={error ? "" : undefined}>
      <label htmlFor={selectId} className={hideLabel ? "x-sr-only" : undefined}>
        {label}
      </label>
      <SelectControl id={selectId} aria-describedby={noteId} aria-invalid={error ? true : undefined} {...rest} />
      {note ? <small id={noteId}>{note}</small> : null}
    </div>
  );
}
