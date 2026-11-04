import type { JSX, ReactNode } from "react";
import { cx } from "../../internal/cx";

export interface SettingRowProps {
  /** Setting name in sentence case ("Restore sessions on launch"). */
  label: ReactNode;
  /** One or two lines on what the setting does. */
  description?: ReactNode;
  /** The control at the right: a Switch, Select, Segmented or Button. */
  control?: ReactNode;
  /** Row id, so search results and deep links can scroll to it. */
  id?: string;
  /** Id of the form control. The label then becomes a <label for> and the description its hint id (`<controlId>-hint`). */
  controlId?: string;
  /** Briefly highlights the row after a jump from search. Re-mount or toggle to replay. */
  flash?: boolean;
  className?: string;
}

export function SettingRow({ label, description, control, id, controlId, flash = false, className }: SettingRowProps): JSX.Element {
  const hintId = controlId && description ? `${controlId}-hint` : undefined;
  return (
    <div className={cx("settings-item", flash && "setting-flash", className)} id={id}>
      <div className="settings-item-text">
        {controlId ? (
          <label className="settings-label" htmlFor={controlId}>
            {label}
          </label>
        ) : (
          <span className="settings-label">{label}</span>
        )}
        {description ? (
          <p className="settings-hint" id={hintId}>
            {description}
          </p>
        ) : null}
      </div>
      {control ? <div className="settings-item-control">{control}</div> : null}
    </div>
  );
}
