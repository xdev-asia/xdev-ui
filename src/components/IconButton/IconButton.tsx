import type { ButtonHTMLAttributes, JSX, Ref } from "react";
import { cx } from "../../internal/cx";
import type { IconName } from "../../icons";
import { Icon } from "../Icon/Icon";
import { Spinner } from "../Spinner/Spinner";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  /** Required: becomes aria-label and title. */
  label: string;
  ref?: Ref<HTMLButtonElement>;
  /** Default "md" (26px, current). "sm" is 22px; "lg" is 44px, the touch target size. */
  size?: "sm" | "md" | "lg";
  /** "danger" marks a destructive action (delete row): danger glyph, danger-soft hover. Default "default". */
  tone?: "default" | "danger";
  /** Async work in flight: a spinner replaces the icon, `aria-busy="true"` is set and the button is disabled.
   *  `label` stays the accessible name. */
  busy?: boolean;
}

export function IconButton({
  icon,
  label,
  size = "md",
  tone = "default",
  busy = false,
  className,
  type = "button",
  disabled,
  onClick,
  ...rest
}: IconButtonProps): JSX.Element {
  return (
    <button
      type={type}
      className={cx("ws-icon-btn", className)}
      aria-label={label}
      title={label}
      data-size={size === "md" ? undefined : size}
      data-tone={tone === "danger" ? "danger" : undefined}
      {...rest}
      disabled={disabled || busy}
      aria-busy={busy ? true : undefined}
      onClick={busy ? undefined : onClick}
    >
      {busy ? (
        <span className="x-btn-busy" aria-hidden="true">
          <Spinner size={size === "sm" ? "sm" : "md"} label="" />
        </span>
      ) : (
        <Icon name={icon} />
      )}
    </button>
  );
}
