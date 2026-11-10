import type { ElementType, HTMLAttributes, JSX, ReactNode } from "react";
import { cx } from "../../internal/cx";

export interface ProseProps extends HTMLAttributes<HTMLElement> {
  /** Element to render. Default "article". */
  as?: ElementType;
  children?: ReactNode;
}

/** Long reading text (legal pages, help, release notes): styles the plain h1-h3, p, ul, ol, a and code inside it. */
export function Prose({ as: Tag = "article", className, children, ...rest }: ProseProps): JSX.Element {
  return (
    <Tag {...rest} className={cx("x-prose", className)}>
      {children}
    </Tag>
  );
}
