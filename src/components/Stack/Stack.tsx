import type { ElementType, HTMLAttributes, JSX, ReactNode } from "react";
import { cx } from "../../internal/cx";

/** Steps of the space scale: 1 = 4px, 2 = 8px, 3 = 12px, 4 = 16px, 6 = 24px, 8 = 32px. */
export type SpaceStep = 0 | 1 | 2 | 3 | 4 | 6 | 8;

export interface StackProps extends HTMLAttributes<HTMLElement> {
  /** "column" stacks top to bottom, "row" left to right. Default "column". */
  direction?: "column" | "row";
  /** Gap between children, a space step. Default 3 (12px). */
  gap?: SpaceStep;
  /** Cross-axis alignment. Default "stretch" for a column, "center" for a row. */
  align?: "start" | "center" | "end" | "stretch" | "baseline";
  /** Main-axis distribution. Default "start". */
  justify?: "start" | "center" | "end" | "between";
  /** Let a row wrap onto the next line when it runs out of space. Default true for a row. */
  wrap?: boolean;
  as?: ElementType;
  children?: ReactNode;
}

export function Stack({ direction = "column", gap = 3, align, justify, wrap, as: Tag = "div", className, children, ...rest }: StackProps): JSX.Element {
  const row = direction === "row";
  return (
    <Tag
      {...rest}
      className={cx("x-stack", className)}
      data-direction={direction}
      data-gap={gap}
      data-align={align ?? (row ? "center" : undefined)}
      data-justify={justify}
      data-wrap={(wrap ?? row) ? "true" : undefined}
    >
      {children}
    </Tag>
  );
}
