import type { AnchorHTMLAttributes, ButtonHTMLAttributes, JSX, ReactNode, Ref } from "react";
import { cx } from "../../internal/cx";
import type { IconName } from "../../icons";
import { Icon } from "../Icon/Icon";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "link";

export interface ButtonCommon {
  /** Default "primary". One primary per surface. */
  variant?: ButtonVariant;
  /** Default "md" (current size). "sm" is a compact button for tables and toolbars. */
  size?: "sm" | "md";
  icon?: IconName;
  children?: ReactNode;
}

/** Button rendered as a `<button>` (no `href`). */
export interface ButtonProps extends ButtonCommon, ButtonHTMLAttributes<HTMLButtonElement> {
  href?: undefined;
  ref?: Ref<HTMLButtonElement>;
}

/** Button rendered as an `<a>` (`href` set). */
export interface ButtonLinkProps extends ButtonCommon, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "type"> {
  /** Renders an `<a>` with the same classes. */
  href: string;
  /** Drops `href` and sets `aria-disabled`; clicks are ignored. */
  disabled?: boolean;
  ref?: Ref<HTMLAnchorElement>;
}


const CLASS: Record<ButtonVariant, string> = {
  primary: "btn",
  secondary: "btn-secondary",
  danger: "btn-danger",
  ghost: "btn-ghost",
  link: "btn-link",
};

export function Button(props: ButtonProps | ButtonLinkProps): JSX.Element {
  const { variant = "primary", size = "md", icon, children, className } = props;
  const cls = cx(CLASS[variant] ?? "btn", className);
  const dataSize = size === "sm" ? "sm" : undefined;
  const content = (
    <>
      {icon ? <Icon name={icon} /> : null}
      {children}
    </>
  );
  if (typeof props.href === "string") {
    const { variant: _v, size: _s, icon: _i, children: _c, className: _cn, href, disabled, onClick, ...rest } = props;
    return (
      <a
        {...rest}
        className={cls}
        data-size={dataSize}
        href={disabled ? undefined : href}
        aria-disabled={disabled ? true : undefined}
        onClick={disabled ? undefined : onClick}
      >
        {content}
      </a>
    );
  }
  const { variant: _v, size: _s, icon: _i, children: _c, className: _cn, href: _h, type = "button", ...rest } = props;
  return (
    <button type={type} className={cls} data-size={dataSize} {...rest}>
      {content}
    </button>
  );
}
