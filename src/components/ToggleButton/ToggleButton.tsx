import type { ButtonHTMLAttributes, JSX, MouseEvent, ReactNode } from "react";
import { cx } from "../../internal/cx";
import { Icon } from "../Icon/Icon";

export type ToggleButtonTone = "default" | "warning";

export interface ToggleButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "aria-pressed" | "onChange"> {
  /** On or off; rendered as aria-pressed. */
  pressed: boolean;
  /** Called with the next value on click, Space or Enter (native button). Not called when `onClick` calls `preventDefault()`. */
  onPressedChange?: (pressed: boolean) => void;
  /** "warning" marks an option that needs care (it grants more than it looks like): warn-coloured border, on and off. Pair it with text that says why. Default "default". */
  tone?: ToggleButtonTone;
  /** "sm" (24px, default) or "md" (32px). */
  size?: "sm" | "md";
  children: ReactNode;
}

/** Pure: the value `onPressedChange` receives for a click on a toggle that is `pressed`. */
export function nextPressed(pressed: boolean): boolean {
  return !pressed;
}

export function ToggleButton({ pressed, onPressedChange, tone = "default", size = "sm", children, className, onClick, ...rest }: ToggleButtonProps): JSX.Element {
  const click = (event: MouseEvent<HTMLButtonElement>): void => {
    onClick?.(event);
    if (!event.defaultPrevented) onPressedChange?.(nextPressed(pressed));
  };
  return (
    <button
      type="button"
      {...rest}
      className={cx("x-toggle", className)}
      aria-pressed={pressed}
      data-tone={tone === "warning" ? "warning" : undefined}
      data-size={size}
      onClick={click}
    >
      <Icon name="check" size={12} className="x-toggle-check" />
      <span className="x-toggle-label">{children}</span>
    </button>
  );
}
