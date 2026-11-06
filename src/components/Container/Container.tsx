import type { ElementType, HTMLAttributes, JSX, ReactNode } from "react";
import { cx } from "../../internal/cx";

export interface ContainerProps extends HTMLAttributes<HTMLElement> {
  /** Max width: `--x-container-<size>`, or "full" for no limit. Default "xl" (1280px). */
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  /** Side padding of `--x-space-4`, so content never touches the screen edge. Default true. */
  gutter?: boolean;
  /** Element to render. Default "div"; use "main" or "section" where it fits. */
  as?: ElementType;
  children?: ReactNode;
}

export function Container({ size = "xl", gutter = true, as: Tag = "div", className, children, ...rest }: ContainerProps): JSX.Element {
  return (
    <Tag {...rest} className={cx("x-container", className)} data-size={size} data-gutter={gutter ? undefined : "false"}>
      {children}
    </Tag>
  );
}
