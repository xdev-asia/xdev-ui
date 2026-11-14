import type { CSSProperties, JSX } from "react";
import { cx } from "../../internal/cx";
import type { IconName } from "../../icons";
import { avatarInitials } from "../Avatar/Avatar";
import { Icon } from "../Icon/Icon";

export interface EmblemProps {
  /** The thing's name: the accessible label, and the source of the letters when `text` is not given. */
  name: string;
  /** One to three letters to show instead of the initials ("OA", "ARK"). */
  text?: string;
  /** A logo: a `data:` or same-origin URL. Shown instead of the letters. */
  src?: string | null;
  /** An icon instead of letters, for a thing that is a kind, not a brand. */
  icon?: IconName;
  /** The thing's own colour, any CSS colour. The tile is a tint of it and the letters lean towards it. Default: the accent. */
  color?: string | null;
  /** 24, 32 or 48 px. Default "md". */
  size?: "sm" | "md" | "lg";
  className?: string;
}

const ICON_SIZE = { sm: 14, md: 18, lg: 24 } as const;

/** A rounded square that stands for one thing (a provider, an integration, a tool): its logo, an icon, or its letters on a tint of its colour. */
export function Emblem({ name, text, src, icon, color, size = "md", className }: EmblemProps): JSX.Element {
  const style = color ? ({ "--x-emblem-color": color } as CSSProperties) : undefined;
  return (
    <span className={cx("x-emblem", className)} data-size={size} data-logo={src ? "" : undefined} role="img" aria-label={name} style={style}>
      {src ? (
        <img className="x-emblem-img" alt="" src={src} />
      ) : icon ? (
        <Icon name={icon} size={ICON_SIZE[size]} />
      ) : (
        <span className="x-emblem-text" aria-hidden="true">
          {Array.from(text?.trim() || avatarInitials(name)).slice(0, 3).join("")}
        </span>
      )}
    </span>
  );
}
