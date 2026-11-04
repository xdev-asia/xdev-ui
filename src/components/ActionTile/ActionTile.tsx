import type { JSX } from "react";
import { cx } from "../../internal/cx";
import type { IconName } from "../../icons";
import { Icon } from "../Icon/Icon";

export interface ActionTileProps {
  /** Leading line icon. */
  icon: IconName;
  /** One short label, sentence case. */
  title: string;
  /** One line that says what the action does. */
  description: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export function ActionTile({ icon, title, description, onClick, disabled = false, className }: ActionTileProps): JSX.Element {
  return (
    <button type="button" className={cx("x-action-tile", className)} disabled={disabled} onClick={onClick}>
      <span className="x-action-tile-icon"><Icon name={icon} size={18} /></span>
      <span className="x-action-tile-title">{title}</span>
      <span className="x-action-tile-desc">{description}</span>
    </button>
  );
}
