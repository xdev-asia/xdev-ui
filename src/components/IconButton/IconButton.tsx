import type { ButtonHTMLAttributes, JSX } from "react";
import { cx } from "../../internal/cx";
import type { IconName } from "../../icons";
import { Icon } from "../Icon/Icon";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  /** Required: becomes aria-label and title. */
  label: string;
}

export function IconButton({ icon, label, className, type = "button", ...rest }: IconButtonProps): JSX.Element {
  return (
    <button type={type} className={cx("ws-icon-btn", className)} aria-label={label} title={label} {...rest}>
      <Icon name={icon} />
    </button>
  );
}
