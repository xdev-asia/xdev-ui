import type { InputHTMLAttributes, JSX, ReactNode } from "react";
import { cx } from "../../internal/cx";

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Names the setting in its "on" state. Omit only with aria-label. */
  label?: ReactNode;
}

export function Switch({ label, className, ...rest }: SwitchProps): JSX.Element {
  const input = <input type="checkbox" role="switch" className={cx("agent-switch", className)} {...rest} />;
  if (!label) return input;
  return (
    <label className="x-switch-row">
      {input}
      {label}
    </label>
  );
}
