import { useState } from "react";
import type { JSX } from "react";
import { cx } from "../../internal/cx";

export interface AvatarProps {
  /** Used for the initials and the accessible label. */
  name: string;
  /** A `data:` or same-origin URL. Falls back to the initials when it is missing or fails to load. */
  src?: string | null;
  /** 20, 32 or 48 px. Default "md". */
  size?: "sm" | "md" | "lg";
  className?: string;
}

/** First code point of the first and last words, upper-cased; "?" when there is no word. */
export function avatarInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  const first = Array.from(words[0])[0] ?? "";
  const last = words.length > 1 ? (Array.from(words[words.length - 1])[0] ?? "") : "";
  return (first + last).toLocaleUpperCase();
}

export function Avatar({ name, src, size = "md", className }: AvatarProps): JSX.Element {
  const [failed, setFailed] = useState<string | null>(null);
  const showImage = Boolean(src) && failed !== src;
  return (
    <span className={cx("x-avatar", className)} data-size={size} role="img" aria-label={name}>
      {showImage ? (
        <img className="x-avatar-img" alt="" src={src ?? undefined} onError={() => setFailed(src ?? null)} />
      ) : (
        <span className="x-avatar-initials" aria-hidden="true">
          {avatarInitials(name)}
        </span>
      )}
    </span>
  );
}
