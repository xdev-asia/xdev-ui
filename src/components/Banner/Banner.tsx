import type { JSX, ReactNode } from "react";
import { Icon } from "../Icon/Icon";

export interface BannerProps {
  title: ReactNode;
  children?: ReactNode;
  /** At most one secondary Button. */
  action?: ReactNode;
}

export function Banner({ title, children, action }: BannerProps): JSX.Element {
  return (
    <div className="banner banner-warn" role="status">
      <Icon name="warn" className="banner-icon" size={20} />
      <div className="banner-text">
        <strong>{title}</strong>
        {children ? <span>{children}</span> : null}
      </div>
      {action ?? null}
    </div>
  );
}
