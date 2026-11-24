import type { AnchorHTMLAttributes, ButtonHTMLAttributes, JSX, ReactNode, Ref } from "react";
import { cx } from "../../internal/cx";
import type { IconName } from "../../icons";
import { Icon } from "../Icon/Icon";
import { Spinner } from "../Spinner/Spinner";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "link";

export interface ButtonCommon {
  /** Default "secondary". Pass `variant="primary"` for the one main action of a surface. */
  variant?: ButtonVariant;
  /** Default "md" (current size). "sm" is a compact button for tables and toolbars. */
  size?: "sm" | "md";
  /** Leading icon, before the label. */
  icon?: IconName;
  /** Trailing icon, after the label: a navigation or disclosure cue (chevron, external), never a second action. */
  iconEnd?: IconName;
  /** Async work in flight: a spinner takes the leading icon's place, `aria-busy="true"` is set and clicks are ignored.
   *  The label stays, so the width holds when the button has an `icon`. */
  busy?: boolean;
  children?: ReactNode;
}

/** Button rendered as a `<button>` (no `href`). */
export interface ButtonProps extends ButtonCommon, ButtonHTMLAttributes<HTMLButtonElement> {
  href?: undefined;
  renderLink?: undefined;
  ref?: Ref<HTMLButtonElement>;
}

/** Props handed to `renderLink`; spread them on your router's link (a Next.js `Link`). */
export interface ButtonRouterLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className" | "children" | "type"> {
  href: string;
  className: string;
  "data-size"?: "sm";
  children: ReactNode;
  ref?: Ref<HTMLAnchorElement>;
}

/** Button rendered as an `<a>` (`href` set). */
export interface ButtonLinkProps extends ButtonCommon, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "type"> {
  /** Renders an `<a>` with the same classes. */
  href: string;
  /** Drops `href` and sets `aria-disabled`; clicks are ignored. */
  disabled?: boolean;
  /** Renders the link through the app's router link instead of `<a>`. Not called while `disabled` or `busy`. */
  renderLink?: (props: ButtonRouterLinkProps) => ReactNode;
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
  const { variant = "secondary", size = "md", icon, iconEnd, busy = false, children, className } = props;
  const cls = cx(CLASS[variant] ?? "btn-secondary", className);
  const dataSize = size === "sm" ? "sm" : undefined;
  const lead = busy ? (
    <span className="x-btn-busy" aria-hidden="true">
      <Spinner size="sm" label="" />
    </span>
  ) : icon ? (
    <Icon name={icon} />
  ) : null;
  const content = (
    <>
      {lead}
      {children}
      {iconEnd ? <Icon name={iconEnd} className="x-btn-icon-end" /> : null}
    </>
  );
  if (typeof props.href === "string") {
    const {
      variant: _v,
      size: _s,
      icon: _i,
      iconEnd: _ie,
      busy: _b,
      children: _c,
      className: _cn,
      href,
      disabled,
      renderLink,
      onClick,
      ...rest
    } = props;
    const inert = disabled || busy;
    if (!inert && renderLink) {
      return <>{renderLink({ ...rest, href, className: cls, "data-size": dataSize, onClick, children: content })}</>;
    }
    return (
      <a
        {...rest}
        className={cls}
        data-size={dataSize}
        href={inert ? undefined : href}
        aria-disabled={inert ? true : undefined}
        aria-busy={busy ? true : undefined}
        onClick={inert ? undefined : onClick}
      >
        {content}
      </a>
    );
  }
  const {
    variant: _v,
    size: _s,
    icon: _i,
    iconEnd: _ie,
    busy: _b,
    children: _c,
    className: _cn,
    href: _h,
    renderLink: _rl,
    type = "button",
    disabled,
    onClick,
    ...rest
  } = props;
  return (
    <button
      type={type}
      className={cls}
      data-size={dataSize}
      {...rest}
      disabled={disabled || busy}
      aria-busy={busy ? true : undefined}
      onClick={busy ? undefined : onClick}
    >
      {content}
    </button>
  );
}
