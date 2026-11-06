import type { ButtonHTMLAttributes, JSX, Ref } from "react";
import { cx } from "../../internal/cx";
import type { IconName } from "../../icons";
import { Icon } from "../Icon/Icon";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  /** Required: becomes aria-label and title. */
  label: string;
  ref?: Ref<HTMLButtonElement>;
  /** Default "md" (26px, current). "sm" is 22px; "lg" is 44px, the touch target size. */
  size?: "sm" | "md" | "lg";
}

export function IconButton({ icon, label, size = "md", className, type = "button", ...rest }: IconButtonProps): JSX.Element {
  return (
    <button type={type} className={cx("ws-icon-btn", className)} aria-label={label} title={label} data-size={size === "md" ? undefined : size} {...rest}>
      <Icon name={icon} />
    </button>
  );
}
