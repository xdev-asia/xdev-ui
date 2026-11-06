import type { JSX, Ref, SelectHTMLAttributes } from "react";
import { cx } from "../../internal/cx";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
  ref?: Ref<HTMLSelectElement>;
}

export function Select({ options, className, ...rest }: SelectProps): JSX.Element {
  return (
    <select className={cx("lang-select", className)} {...rest}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
