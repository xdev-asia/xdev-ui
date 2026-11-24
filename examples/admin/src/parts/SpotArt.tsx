import type { JSX } from "react";
import { Icon, type IconName } from "@xdev-asia/ui";

/** A spot illustration for whole-page states, standing in for react-antd-admin's drawings: a large glyph on a soft disc with a badge. Decorative. */
export function SpotArt({ icon, badge, tone = "accent" }: { icon: IconName; badge: IconName; tone?: "accent" | "warn" | "danger" | "ok" }): JSX.Element {
  return (
    <span className="app-spot" data-tone={tone}>
      <span className="app-spot-disc" />
      <Icon name={icon} size={64} />
      <span className="app-spot-badge">
        <Icon name={badge} size={20} />
      </span>
    </span>
  );
}
