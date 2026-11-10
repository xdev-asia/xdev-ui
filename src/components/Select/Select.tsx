import type { JSX, Ref, SelectHTMLAttributes } from "react";
import { cx } from "../../internal/cx";
import type { IconName } from "../../icons";
import { Icon } from "../Icon/Icon";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
  ref?: Ref<HTMLSelectElement>;
  /** Leading icon inside the control, such as "globe" for a language picker. Decorative: the select still needs a label. */
  icon?: IconName;
}

export function Select({ options, className, icon, ...rest }: SelectProps): JSX.Element {
  const select = (
    <select className={cx("lang-select", className)} data-icon={icon ? "" : undefined} {...rest}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
  if (!icon) return select;
  return (
    <span className="x-select-wrap">
      <Icon name={icon} className="x-select-icon" />
      {select}
    </span>
  );
}
