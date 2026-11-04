import type { ButtonHTMLAttributes, JSX, ReactNode } from "react";
import { cx } from "../../internal/cx";
import type { IconName } from "../../icons";
import { Icon } from "../Icon/Icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Default "primary". One primary per surface. */
  variant?: "primary" | "secondary";
  icon?: IconName;
  children?: ReactNode;
}

export function Button({ variant = "primary", icon, children, className, type = "button", ...rest }: ButtonProps): JSX.Element {
  return (
    <button type={type} className={cx(variant === "secondary" ? "btn-secondary" : "btn", className)} {...rest}>
      {icon ? <Icon name={icon} /> : null}
      {children}
    </button>
  );
}
