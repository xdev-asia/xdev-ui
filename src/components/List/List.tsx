import type { HTMLAttributes, JSX, ReactNode } from "react";
import { cx } from "../../internal/cx";
import type { SpaceStep } from "../Stack/Stack";

export interface ListProps extends HTMLAttributes<HTMLElement> {
  /** Render an `ol` instead of a `ul`. Default false. */
  ordered?: boolean;
  /** Space between items on the space scale. Default: 2px, the ListRow spacing. */
  gap?: SpaceStep;
  children?: ReactNode;
}

/** Plain list for rows (`ListRow as="li"`): no bullets, no indent, one column with a gap. */
export function List({ ordered = false, gap, className, children, ...rest }: ListProps): JSX.Element {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag {...rest} className={cx("x-list", className)} data-gap={gap === undefined ? undefined : gap}>
      {children}
    </Tag>
  );
}
