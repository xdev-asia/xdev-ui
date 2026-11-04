import type { JSX, ReactNode } from "react";
import { cx } from "../../internal/cx";

export interface TagProps {
  tone?: "default" | "warn";
  children: ReactNode;
}

export function Tag({ tone = "default", children }: TagProps): JSX.Element {
  return <span className={cx("ws-tag", tone === "warn" && "ws-tag-warn")}>{children}</span>;
}
