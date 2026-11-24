import { useId, type InputHTMLAttributes, type JSX, type ReactNode } from "react";
import { cx } from "../../internal/cx";

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Names the setting in its "on" state. Omit only with aria-label. */
  label?: ReactNode;
  /** One short line under the label, linked with aria-describedby. */
  hint?: ReactNode;
  /** Keeps the label for screen readers only, for table cells whose column header already names the setting. */
  hideLabel?: boolean;
}

export function Switch(props: SwitchProps): JSX.Element {
  // The hint needs an id (a hook); without one the switch stays a plain function of its props.
  return props.hint != null ? <SwitchWithHint {...props} /> : SwitchControl(props);
}

function SwitchControl({ label, hint: _hint, hideLabel, className, ...rest }: SwitchProps): JSX.Element {
  const input = <input type="checkbox" role="switch" className={cx("agent-switch", className)} {...rest} />;
  if (!label) return input;
  return (
    <label className="x-switch-row">
      {input}
      {hideLabel ? <span className="x-sr-only">{label}</span> : label}
    </label>
  );
}

function SwitchWithHint({ hint, id, ...rest }: SwitchProps): JSX.Element {
  const auto = useId();
  const inputId = id ?? `x-switch-${auto}`;
  const hintId = `${inputId}-hint`;
  return (
    <span className="x-switch-field">
      <SwitchControl id={inputId} aria-describedby={hintId} {...rest} />
      <small id={hintId} className="x-switch-hint">
        {hint}
      </small>
    </span>
  );
}
