import type { CSSProperties, JSX } from "react";
import { cx } from "../../internal/cx";
import { ICONS, type IconName } from "../../icons";

export interface IconProps {
  name: IconName;
  /** Default 16. Stroke stays 1.75. */
  size?: number;
  /** Set only when the icon stands alone. */
  label?: string;
  className?: string;
  style?: CSSProperties;
}

export function Icon({ name, size = 16, label, className, style }: IconProps): JSX.Element {
  const parts = ICONS[name] ?? ICONS.docs;
  return (
    <svg
      className={cx("x-icon", className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      aria-label={label}
      style={style}
    >
      {parts.map(([Tag, attrs], i) => {
        const El = Tag as "path";
        return <El key={i} {...(attrs as object)} />;
      })}
    </svg>
  );
}
