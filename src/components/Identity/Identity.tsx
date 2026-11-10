import type { JSX, ReactNode } from "react";
import { cx } from "../../internal/cx";
import { Avatar } from "../Avatar/Avatar";

export interface IdentityProps {
  /** Display name: the first line, and the avatar's initials. */
  name: string;
  /** Second line, muted: usually the email or the handle. */
  detail?: ReactNode;
  /** Avatar picture; initials show when it is missing or fails. */
  src?: string | null;
  /** Avatar size. Default "lg" (48px), for profile and account pages; "md" (32px) in lists. */
  size?: "md" | "lg";
  className?: string;
}

/** A person at a glance: avatar, name and one muted line. */
export function Identity({ name, detail, src, size = "lg", className }: IdentityProps): JSX.Element {
  return (
    <div className={cx("x-identity", className)} data-size={size}>
      {/* The name is written next to it, so the picture is decorative here. */}
      <span className="x-identity-avatar" aria-hidden="true">
        <Avatar name={name} src={src} size={size} />
      </span>
      <span className="x-identity-text">
        <strong className="x-identity-name">{name}</strong>
        {detail ? <span className="x-identity-detail">{detail}</span> : null}
      </span>
    </div>
  );
}
