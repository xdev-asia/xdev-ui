import type { JSX, ReactNode } from "react";
import type { IconName } from "../../icons";
import { Icon } from "../Icon/Icon";

export type BannerTone = "info" | "ok" | "warn" | "danger";

export interface BannerProps {
  title: ReactNode;
  children?: ReactNode;
  /** At most one secondary Button. */
  action?: ReactNode;
  /** Default "warn". "danger" uses role="alert"; the others role="status". */
  tone?: BannerTone;
}

const ICON: Record<BannerTone, IconName> = { info: "info", ok: "check-circle", warn: "warn", danger: "alert" };

export function Banner({ title, children, action, tone = "warn" }: BannerProps): JSX.Element {
  return (
    <div className={`banner banner-${tone}`} role={tone === "danger" ? "alert" : "status"}>
      <Icon name={ICON[tone] ?? "warn"} className="banner-icon" size={20} />
      <div className="banner-text">
        <strong>{title}</strong>
        {children ? <span>{children}</span> : null}
      </div>
      {action ?? null}
    </div>
  );
}
